import Minigame from '../models/minigameSchema.js';
import MinigameSession from '../models/minigameSession.js';
import User from '../models/user.js';
import { awardMinigameReward } from './storyController.js';

// Base scores per minigame (from user specification)
const BASE_SCORES = {
  M1: 150,
  M2: 100,
  M3: 200,
  M4: 250,
  M5: 200,
  M6: 150,
  M7: 150,
};

// Centralized helper: check all minigames for expired timers and decrement tries for M4-M6 when expired
export const checkAndExpireTimers = async () => {
  try {
    const now = Date.now();
    const minigames = await Minigame.find({});
    const changed = [];
    for (const mg of minigames) {
      // if a startedAt exists and timer is set, evaluate expiry
      if (mg.startedAt && mg.timer) {
        const elapsed = Math.floor((now - mg.startedAt) / 1000); // seconds elapsed
        if (elapsed >= mg.timer) {
          // Timer expired
          if (["M4", "M5", "M6"].includes(mg.minigameId)) {
            if (typeof mg.tries === 'number' && mg.tries > 0) {
              mg.tries -= 1;
            }
          }
          // clear startedAt so we don't repeatedly decrement
          delete mg.startedAt;
          changed.push(mg);
        }
      }
    }
    if (changed.length) {
      for (const m of changed) await m.save();
    }
    return changed.length;
  } catch (err) {
    console.error('checkAndExpireTimers error:', err);
    throw err;
  }
};

// Combined endpoints using schema values
export const initializeMinigames = async (req, res) => {
  try {
    const minigameIds = ["M1", "M2", "M3", "M4", "M5", "M6", "M7"];
    const created = [];
    for (const id of minigameIds) {
      let minigame = await Minigame.findOne({ minigameId: id });
      if (!minigame) {
        minigame = new Minigame({ minigameId: id });
        await minigame.save();
        created.push(minigame);
      }
    }
    return res.json({ message: "Minigames initialized", minigames: created });
  } catch (err) {
    console.error("Initialize minigames error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getAllMinigames = async (req, res) => {
  try {
    // run expiry check before returning state
    await checkAndExpireTimers();
    const minigames = await Minigame.find({});
    return res.json({ minigames });
  } catch (err) {
    console.error("Get all minigames error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getMinigameState = async (req, res) => {
  try {
    await checkAndExpireTimers();
    const { minigameId } = req.query;
    const mg = await Minigame.findOne({ minigameId });
    if (!mg) return res.status(404).json({ message: 'Minigame not found' });
    return res.json({ minigameId: mg.minigameId, timer: mg.timer, tries: mg.tries });
  } catch (err) {
    console.error('Get minigame state error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const decrementTries = async (req, res) => {
  try {
    const { minigameId } = req.body;
    if (!["M4", "M5", "M6"].includes(minigameId)) return res.status(400).json({ message: "Only M4, M5, M6 have tries" });
    const mg = await Minigame.findOne({ minigameId });
    if (!mg) return res.status(404).json({ message: 'Minigame not found' });
    if (typeof mg.tries !== 'number') return res.status(400).json({ message: 'Minigame does not use tries' });
    if (mg.tries <= 0) return res.status(400).json({ message: 'No tries left' });
    mg.tries -= 1;
    await mg.save();
    return res.json({ message: 'Tries decremented', minigameId, tries: mg.tries });
  } catch (err) {
    console.error('Decrement tries error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const resetTimer = async (req, res) => {
  try {
    const { minigameId } = req.body;
    const mg = await Minigame.findOne({ minigameId });
    if (!mg) return res.status(404).json({ message: 'Minigame not found' });
    mg.timer = 300;
    delete mg.startedAt;
    await mg.save();
    return res.json({ message: 'Timer reset', minigameId, timer: mg.timer });
  } catch (err) {
    console.error('Reset timer error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Start a minigame: set startedAt and ensure timer/tries are initialized
export const startMinigame = async (req, res) => {
  try {
    const { minigameId } = req.body;
    if (!minigameId) return res.status(400).json({ message: 'minigameId required' });
    const mg = await Minigame.findOne({ minigameId });
    if (!mg) return res.status(404).json({ message: 'Minigame not found' });

    // initialize tries for M4-M6 if absent
    if (["M4", "M5", "M6"].includes(minigameId) && (mg.tries === null || mg.tries === undefined)) {
      mg.tries = 3;
    }

    // set startedAt to now
    mg.startedAt = new Date();
    await mg.save();
    return res.json({ message: 'Minigame started', minigameId: mg.minigameId, timer: mg.timer, tries: mg.tries, startedAt: mg.startedAt });
  } catch (err) {
    console.error('Start minigame error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ---------------- Per-User Session Endpoints ----------------
// helper: compute remaining seconds based on startedAt + timerSeconds
const computeRemaining = (session) => {
  if (!session.startedAt) return session.timerSeconds; // not started yet
  const elapsed = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
  const remaining = session.timerSeconds - elapsed;
  return remaining > 0 ? remaining : 0;
};

export const startSession = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { minigameId } = req.body;
    if (!userId) return res.status(401).json({ message: 'Auth required' });
    if (!minigameId) return res.status(400).json({ message: 'minigameId required' });

    // Ensure base minigame exists for config reference
    const base = await Minigame.findOne({ minigameId });
    if (!base) return res.status(404).json({ message: 'Minigame not found' });

  let session = await MinigameSession.findOne({ user: userId, minigameId });
    if (!session) {
  session = new MinigameSession({
        user: userId,
        minigameId,
        timerSeconds: base.timer || 300,
        triesLeft: [ 'M4','M5','M6' ].includes(minigameId) ? 5 : 0,
        startedAt: new Date(),
      });
      await session.save();
    } else if (!session.completed) {
      // If not completed and no active startedAt (e.g. expired earlier), restart if time is zero
      const remaining = computeRemaining(session);
      if (remaining === 0) {
        session.startedAt = new Date();
        await session.save();
      }
    }
    return res.json({
      message: 'Session started',
      session: {
        id: session._id,
        minigameId: session.minigameId,
        remainingSeconds: computeRemaining(session),
        triesLeft: session.triesLeft,
        completed: session.completed,
        score: session.score,
      }
    });
  } catch (err) {
    console.error('startSession error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getSessionState = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { minigameId } = req.query;
    if (!userId) return res.status(401).json({ message: 'Auth required' });
    if (!minigameId) return res.status(400).json({ message: 'minigameId required' });
  const session = await MinigameSession.findOne({ user: userId, minigameId });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    const remainingSeconds = computeRemaining(session);
    return res.json({
      session: {
        id: session._id,
        minigameId: session.minigameId,
        remainingSeconds,
        triesLeft: session.triesLeft,
        completed: session.completed,
        score: session.score,
      }
    });
  } catch (err) {
    console.error('getSessionState error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const decrementTrySession = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { minigameId } = req.body;
    if (!userId) return res.status(401).json({ message: 'Auth required' });
    if (!minigameId) return res.status(400).json({ message: 'minigameId required' });
    if (!['M4','M5','M6'].includes(minigameId)) return res.status(400).json({ message: 'No tries for this minigame' });
  const session = await MinigameSession.findOne({ user: userId, minigameId });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.triesLeft <= 0) return res.status(400).json({ message: 'No tries left' });
    session.triesLeft -= 1;
    await session.save();
    return res.json({ message: 'Try decremented', triesLeft: session.triesLeft });
  } catch (err) {
    console.error('decrementTrySession error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const completeSession = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { minigameId } = req.body;
    if (!userId) return res.status(401).json({ message: 'Auth required' });
    if (!minigameId) return res.status(400).json({ message: 'minigameId required' });
  const session = await MinigameSession.findOne({ user: userId, minigameId });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.completed) return res.json({ message: 'Already completed', score: session.score });

    const elapsed = session.startedAt ? Math.floor((Date.now() - session.startedAt.getTime())/1000) : session.timerSeconds;
    const timer = session.timerSeconds;
    // New scoring: Evaluated score = max(0, baseScore * (1 - max(0, (timeUsed - 60) / (totalTime - 60))))
    const baseScore = BASE_SCORES[minigameId] || 100; // fallback to 100 if missing
    let score;
    // Full base score only if completed in strictly less than 60 seconds
    if (elapsed < 60) {
      score = baseScore; // full base score for <60s
    } else if (elapsed >= timer) {
      score = 0;
    } else {
      const penaltyFraction = Math.max(0, (elapsed - 60) / (timer - 60));
      score = Math.max(0, Math.round(baseScore * (1 - penaltyFraction)));
    }
    session.completed = true;
    session.completedAt = new Date();
    session.score = score;
    await session.save();

    return res.json({ message: 'Session completed', score, sessionId: session._id, minigameId });
  } catch (err) {
    console.error('completeSession error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Claim reward after completion (idempotent) - uses existing awardMinigameReward logic
export const claimMinigameReward = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { minigameId } = req.body;
    if (!userId) return res.status(401).json({ message: 'Auth required' });
    if (!minigameId) return res.status(400).json({ message: 'minigameId required' });
    const session = await MinigameSession.findOne({ user: userId, minigameId });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (!session.completed) return res.status(400).json({ message: 'Minigame not completed yet' });
    if (session.rewardClaimed) {
      return res.json({ message: 'Reward already claimed', score: session.score, claimed: true });
    }

    // Reuse awardMinigameReward controller: fabricate req/res wrappers
    const mockReq = { user: { id: userId }, body: { storyId: minigameId, success: true } };
    let rewardResponse;
    const mockRes = {
      status(code) { this.statusCode = code; return this; },
      json(payload) { rewardResponse = { statusCode: this.statusCode || 200, payload }; return payload; }
    };
    await awardMinigameReward(mockReq, mockRes);

    session.rewardClaimed = true;
    await session.save();

    return res.json({
      message: 'Reward claimed',
      score: session.score,
      reward: rewardResponse?.payload?.awarded || null,
      userState: rewardResponse?.payload?.userState || null
    });
  } catch (err) {
    console.error('claimMinigameReward error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
