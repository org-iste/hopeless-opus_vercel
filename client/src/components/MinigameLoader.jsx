import React, { Suspense, useEffect, useCallback } from 'react';
import useMinigameSession from '../lib/useMinigameSession';
import API_BASE from '../lib/api_endpoint';

// Lazy-load minigame components to reduce bundle size
const M1 = React.lazy(() => import('../Minigames/M1'));
const M2 = React.lazy(() => import('../Minigames/M2'));
const M3 = React.lazy(() => import('../Minigames/M3'));
const M4 = React.lazy(() => import('../Minigames/M4'));
const M5 = React.lazy(() => import('../Minigames/M5'));
const M6 = React.lazy(() => import('../Minigames/M6'));
const M7 = React.lazy(() => import('../Minigames/M7'));

const MAP = {
  M1,
  M2,
  M3,
  M4,
  M5,
  M6,
  M7,
};

export default function MinigameLoader({ id, config, onComplete }) {
  useEffect(() => { console.log('[MinigameLoader] mount id=', id); }, [id]);

  const { session, remainingSeconds, triesLeft, api } = useMinigameSession(id);

  // Games now self-manage expiry & tries failure; loader only provides dev controls.

  const handleComplete = useCallback(async (success) => {
    try {
      if (success) {
        // Complete session to compute and persist score
        await api.completeSession();
        // Attempt to claim reward (ignore errors to avoid blocking flow)
        try {
          const token = localStorage.getItem('token');
          await fetch(`${API_BASE}/minigame/session/claim-reward`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ minigameId: id })
          });
        } catch (rewardErr) {
          console.warn('Reward claim failed:', rewardErr);
        }
      }
      onComplete(success);
    } catch (e) {
      console.error('Error completing session', e);
      onComplete(success);
    }
  }, [api, onComplete, id]);

  const Component = MAP[id];

  if (!Component) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="mb-4">Unknown minigame: {id}</div>
          <button
            className="px-4 py-2 rounded bg-red-500"
            onClick={() => onComplete(false)}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen">
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white">Loading {id}…</div>}>
        <div className="relative w-full h-full">
          {/* Dev/Test Success Toggle */}
          <div className="absolute top-2 left-2 z-50 flex gap-2">
            <button
              className="px-3 py-1 rounded bg-green-600 text-white text-sm"
              onClick={() => handleComplete(true)}
            >Force Success</button>
            <button
              className="px-3 py-1 rounded bg-red-600 text-white text-sm"
              onClick={() => handleComplete(false)}
            >Force Fail</button>
          </div>
          <Component
            config={config}
            onComplete={handleComplete}
            session={session}
            sessionApi={api}
          />
        </div>
      </Suspense>
    </div>
  );
}
