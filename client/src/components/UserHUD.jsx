import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ITEM_ICON = {
  script: '📜',
  journal: '📓',
  kumbh: '🏺',
  sword: '🗡️',
  pickaxe: '⛏️',
  axe: '🪓',
};

const UserHUD = ({ userState }) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const inventory = userState?.inventory || {};
  const points = userState?.points ?? 0;

  const items = Object.keys(inventory).map(key => ({ key, ...(inventory[key] || {}) }));
  const ownedCount = items.filter(i => i.value).length;

  // Close on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    window.addEventListener('mousedown', onDocClick);
    return () => window.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const navigate = useNavigate();

  // Exit button handler: clear token/user and go home
  const handleExit = () => {
    navigate('/');
  };

  // Axios interceptor to catch 401 (token expired) and force logout
  // Token expiry handling is centralized in App.jsx via a global axios interceptor

  return (
    <div className="absolute top-4 left-4 z-50 flex items-center space-x-3 select-none">
      <div className="px-3 py-2 bg-black/60 text-white rounded-md shadow flex items-center gap-3 border border-white/5">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a2 2 0 0 0-2 2v1H7a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3h-3V4a2 2 0 0 0-2-2z" />
          </svg>
          <div className="text-sm leading-tight">
            <div className="text-xs text-gray-300">Points</div>
            <div className="font-semibold">{points}</div>
          </div>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls="hud-inventory"
          className="relative px-3 py-2 bg-black/60 text-white rounded-md shadow hover:bg-black/80 transition flex items-center gap-2"
          title="Open bag"
        >
          <span className="text-lg">👜</span>
          {ownedCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow">{ownedCount}</span>
          )}
        </button>

        {/* Inventory panel */}
        <div
          id="hud-inventory"
          ref={panelRef}
          style={{ transform: open ? 'translateY(0)' : 'translateY(-6px)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
          className={`absolute left-0 mt-12 w-64 bg-white text-black rounded-lg shadow-2xl p-3 z-60 transition-all duration-200 ease-out origin-top`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-sm">Inventory</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setOpen(false)} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {items.length === 0 && (
              <div className="col-span-3 text-sm text-gray-500">No items</div>
            )}

            {items.map(item => (
              <div key={item.key} className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded border border-gray-100">
                <div className="text-2xl">{ITEM_ICON[item.key] || '🎁'}</div>
                <div className="text-xs font-medium mt-1">{item.key}</div>
                <div className="text-[10px] text-gray-500 mt-1">{item.description || (item.value ? 'Owned' : '')}</div>
                {item.value ? (
                  <div className="mt-1 text-xs text-green-600">✓</div>
                ) : (
                  <div className="mt-1 text-xs text-gray-400">—</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <button onClick={handleExit} className="text-sm text-red-600 hover:text-red-800">Exit</button>
      </div>
    </div>
  );
};

export default UserHUD;
