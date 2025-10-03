import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import your minigame components
import MinigameLoader from './MinigameLoader';
import UserHUD from './UserHUD';

// --- Config ---
const TYPING_SPEED = 30;
import API_BASE from '../lib/api_endpoint';
const API_STORY = `${API_BASE}/story`;

// Minigame rendering is delegated to MinigameLoader

const VisualNovelInterface = () => {
  const [storyData, setStoryData] = useState(null);
  const [userState, setUserState] = useState({ points: 0, inventory: {} });
  const [fullDialogue, setFullDialogue] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isSkipping, setIsSkipping] = useState(false);
  
  // Minigame state
  const [activeMinigame, setActiveMinigame] = useState(null);
  const [minigameConfig, setMinigameConfig] = useState(null);
  const [pendingStory, setPendingStory] = useState(null);
  const [awardMessage, setAwardMessage] = useState(null);
  const [sceneVisible, setSceneVisible] = useState(true);

  const getToken = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    const fetchCurrentStory = async () => {
      try {
        const res = await axios.get(`${API_BASE}/current/me`, getToken());
        const { story, userState: serverUserState } = res.data;

        if (story) {
          setStoryData(story);
          setFullDialogue(story.text.join("\n"));
          setDisplayedText("");
          setIsSkipping(false);
          if (serverUserState) setUserState(serverUserState);
        }
      } catch (err) {
        console.error("Error fetching current story:", err);
      }
    };

    fetchCurrentStory();
  }, []);

  useEffect(() => {
    if (isSkipping || !fullDialogue) return;

    if (displayedText.length < fullDialogue.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullDialogue.substring(0, displayedText.length + 1));
      }, TYPING_SPEED);
      return () => clearTimeout(timeout);
    }
  }, [displayedText, isSkipping, fullDialogue]);

  const fetchStoryById = async (storyId) => {
    try {
      const res = await axios.get(`${API_BASE}/${storyId}`, getToken());
      return res.data;
    } catch (err) {
      console.error("Error fetching story by ID:", err);
      return null;
    }
  };

  const handleChoiceClick = async (id, index) => {
    setSelectedChoice(id);

    try {
      const res = await axios.post(
        `${API_BASE}/current/choice`,
        { storyId: storyData.storyID, choiceIndex: index },
        getToken()
      );
  console.log("Choice response:", res.data);
  const { nextStory, minigame, userState: serverUserState } = res.data;
  if (serverUserState) setUserState(serverUserState);

      // Check if minigame was triggered
      if (minigame) {
        setActiveMinigame(minigame.id);
        setMinigameConfig(minigame.config[minigame.id]);
        
        // Store the next story to show after minigame
        setPendingStory(nextStory);
      } else if (nextStory) {
        setStoryData(nextStory);
        setFullDialogue(nextStory.text.join("\n"));
        setDisplayedText("");
        setIsSkipping(false);
        setSelectedChoice(null);
      }
    } catch (err) {
      console.error("Error making choice:", err);
    }
  };

  // Fade transition for scene changes
  useEffect(() => {
    setSceneVisible(false);
    const t = setTimeout(() => setSceneVisible(true), 60);
    return () => clearTimeout(t);
  }, [storyData?.storyID]);

  const handleMinigameComplete = async (success) => {
    setActiveMinigame(null);
    setMinigameConfig(null);

    // Refresh user state (reward claimed already if success)
    try {
      const res = await axios.get(`${API_BASE}/current/me`, getToken());
      if (res.data?.userState) setUserState(res.data.userState);
    } catch (e) {
      console.warn('User state refresh failed after minigame', e.response?.data || e.message || e);
    }

    // Branching logic: success -> nextID[0], failure -> nextID[1]
    // Priority order:
    // 1. If explicit pendingStory (returned from choice that launched minigame), use that (overrides generic nextID branching).
    // 2. Else use storyData.nextID based on success/fail.
    // 3. Fallback to first available nextID if selected index missing.
    // 4. Final fallback: reload current story from server.

    // 1. Pending story override
    if (pendingStory) {
      const ps = pendingStory;
      setStoryData(ps);
      setFullDialogue(ps.text?.length ? ps.text.join('\n') : '');
      setDisplayedText('');
      setIsSkipping(false);
      setPendingStory(null);
      setSelectedChoice(null);
      return;
    }

    const nextIDs = storyData?.nextID || [];
    let targetId = null;
    if (nextIDs.length) {
      if (success) {
        targetId = nextIDs[0];
      } else if (nextIDs.length > 1) {
        targetId = nextIDs[1];
      } else {
        // failure but only one branch; fall back to the sole nextID
        targetId = nextIDs[0];
      }
    }

    if (targetId) {
      try {
        const node = await fetchStoryById(targetId);
        if (node) {
          setStoryData(node);
          setFullDialogue(node.text?.length ? node.text.join('\n') : '');
          setDisplayedText('');
          setIsSkipping(false);
          setSelectedChoice(null);
          return;
        }
      } catch (e) {
        console.error('Failed to fetch branched node', e);
      }
    }

    // 4. Final fallback: reload current story
    try {
      const res = await axios.get(`${API_BASE}/current/me`, getToken());
      const { story } = res.data || {};
      if (story) {
        setStoryData(story);
        setFullDialogue(story.text?.length ? story.text.join('\n') : '');
        setDisplayedText('');
        setIsSkipping(false);
        setSelectedChoice(null);
      }
    } catch (err) {
      console.error('Final fallback failed after minigame', err);
    }
  };

  const handleSkip = () => {
    setDisplayedText(fullDialogue);
    setIsSkipping(true);
  };

  const handleNext = async () => {
    if (!storyData) return;

    try {
      let nextStory = null;

      if (storyData.levelEnd) {
        const res = await axios.post(
          `${API_BASE}/level-end`,
          { storyId: storyData.storyID },
          getToken()
        );
        nextStory = res.data.nextStory;
      } else if (storyData.nextID?.length > 0) {
        nextStory = await fetchStoryById(storyData.nextID[0]);
      }

      if (nextStory) {
        // If the next story node is a minigame, trigger the minigame UI
        if (nextStory.storyID && nextStory.storyID.startsWith('M')) {
          console.log('Next story is a minigame, launching:', nextStory.storyID);
          setStoryData(nextStory);
          setFullDialogue(nextStory.text?.join('\n') || '');
          setDisplayedText('');
          setIsSkipping(false);
          setSelectedChoice(null);
          setActiveMinigame(nextStory.storyID);
          // If the story provides a minigame config, use it; otherwise leave null
          if (nextStory.minigameConfig) setMinigameConfig(nextStory.minigameConfig);
          else setMinigameConfig(null);
        } else {
          setStoryData(nextStory);
          setFullDialogue(nextStory.text.join("\n"));
          setDisplayedText("");
          setIsSkipping(false);
          setSelectedChoice(null);
        }
      }
    } catch (err) {
      console.error("Error updating user story on level end:", err);
    }
  };

  const renderChoiceButtons = () => (
    <div className="flex flex-col space-y-3 w-full">
      {storyData?.choice?.map((choiceText, idx) => (
        <button
          key={idx}
          onClick={() => handleChoiceClick(idx + 1, idx)}
          className={`
            relative flex items-center justify-start py-1.5 px-4 rounded-3xl text-white text-base
            font-thin italic shadow-xl transition-all duration-200 ease-in-out border border-gray-600/50
            bg-white/40 backdrop-blur-sm w-80
            hover:scale-[1.02] hover:bg-white/60
            ${selectedChoice === idx + 1 ? 'ring-4 ring-blue-500 ring-opacity-70' : ''}
          `}
        >
          <span className="truncate">{choiceText}</span>
        </button>
      ))}
    </div>
  );

  const renderDialogue = () => (
    <div className="relative">
      {displayedText.length === fullDialogue.length && storyData?.nextID?.length > 0 && !storyData?.choice?.length && (
        <div className="flex justify-end mb-2">
          <button
            onClick={handleNext}
            className="text-lg italic px-4 py-2 text-white rounded-xl hover:bg-gray-600/25 transition"
          >
            Next &gt;&gt;
          </button>
        </div>
      )}

      <div className="text-xl text-gray-200 font-light whitespace-pre-line">
        {displayedText}
        {displayedText.length < fullDialogue.length && (
          <span className="animate-pulse text-white">_</span>
        )}
      </div>
    </div>
  );

  // If minigame is active, render it via MinigameLoader
  if (activeMinigame) {
    return (
      <div className="w-screen h-screen relative">
        <UserHUD userState={userState} />
        <div style={{ opacity: sceneVisible ? 1 : 0, transition: 'opacity 260ms ease' }}>
          <MinigameLoader id={activeMinigame} config={minigameConfig} onComplete={handleMinigameComplete} />

          {/* Temporary test button for devs: simulate minigame completion (success) */}
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => handleMinigameComplete(true)}
              className="px-3 py-2 bg-green-600 text-white rounded-md shadow-lg hover:bg-green-500 transition"
              title="Dev-only: simulate successful completion of the minigame"
            >
              Test: Complete (Success)
            </button>
          </div>
          {awardMessage && (
            <div className="absolute top-16 right-4 z-50 px-3 py-2 bg-yellow-500 text-black rounded shadow">
              {awardMessage}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-black flex items-end justify-center font-inter"
      style={{
        backgroundImage: storyData?.backgroundImg ? `url(${storyData.backgroundImg})` : 'linear-gradient(to bottom, #1a1a2e, #16213e)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.85)'
      }}
    >
      <UserHUD userState={userState} />

      <div style={{ opacity: sceneVisible ? 1 : 0, transition: 'opacity 260ms ease' }} className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

        <div className="absolute bottom-[5vh] left-[5%] w-[90%] z-10"> 
          <div className="absolute right-4 z-20 w-80" style={{ bottom: '180px' }}>
            {renderChoiceButtons()}
          </div>

          <div 
            className="absolute z-30 text-white text-3xl italic font-bold" 
            style={{ textShadow: '0 0 8px rgba(0, 0, 0, 0.9)', bottom: 'calc(180px - 10px)', left: '25px' }}
          >
            {storyData?.characterName || " "}
          </div>

          <div className="relative bg-black/50 backdrop-blur-sm w-full p-6 rounded-xl border-[3px] border-gray-500 min-h-[150px]">
            {renderDialogue()}
            {displayedText.length < fullDialogue.length && (
              <button
                onClick={handleSkip}
                className="absolute bottom-4 right-6 text-lg italic px-4 py-2 text-white rounded-xl hover:bg-gray-600/25 transition"
              >
                Skip &gt;&gt;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualNovelInterface;