export type BlockType = 'control' | 'prestige' | 'dominance';

// Researcher time tracking interfaces
export interface ResearcherSession {
  id: string;
  researcherName: string;
  signInTime: number;
  signOutTime?: number;
  date: string; // YYYY-MM-DD format
  sessionsCompleted?: number; // Number of sessions completed during this shift
  note?: string; // Optional note field for tracking status
}

// EST timezone utilities (inline to avoid import issues)
const getESTTimestamp = (): number => {
  const now = new Date();
  const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  return estTime.getTime();
};

const getESTDate = (): string => {
  const now = new Date();
  const estDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  
  const year = estDate.getFullYear();
  const month = String(estDate.getMonth() + 1).padStart(2, '0');
  const day = String(estDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

const formatESTDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

export interface Block {
  blockType: BlockType;
  vignetteStartedAt: number;
  survey: Record<string, string | number>;
  drawing: { 
    pngUrl: string; 
    area: number;
    maxWidth: number;
    maxHeight: number;
    verticality: number;
  };
}

export interface Session {
  // Core session identification
  id: string;
  sessionId?: string; // Legacy field for backward compatibility
  
  // Experimental design fields
  order: ['prestige','dominance'] | ['dominance','prestige']; // set once - this is the order for blocks 2 & 3
  presentedFirst: 'prestige' | 'dominance'; // tracks which condition came first (block 2)
  blocks: Block[]; // Should contain exactly 3 blocks: control, then prestige/dominance in randomized order
  
  // Additional data fields (from old SessionData interface)
  experimenter?: string;
  sessionNotes?: string;
  demographics?: Record<string, string>;
  allResponses?: Record<string, unknown>; // All survey responses combined for MongoDB sync
  
  // Drawing data (for compatibility)
  drawingData?: {
    totalArea: number;
    maxWidth: number;
    maxHeight: number;
    drawingImageUrl?: string;
  };
  
  // Sync tracking
  syncedAt?: number;
  syncTime?: string;
  
  // Temporary fields used during the session
  tempVignetteStart?: number;
  tempSurvey?: Record<string, string | number>;
}

const STORAGE_KEY = "session";
const COMPLETED_SESSIONS_KEY = "completedSessions";
const CURRENT_SESSION_KEY = "currentSession";

/**
 * Get the current active session from local storage.
 * Returns null if no session exists or if localStorage is not available (SSR).
 */
export const getCurrentSession = (): Session | null => {
  if (typeof window === 'undefined') return null; // SSR check
  const data = localStorage.getItem(CURRENT_SESSION_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as Session;
  } catch (error) {
    console.error("Error parsing current session from localStorage:", error);
    return null;
  }
};

/**
 * Save the current active session to local storage.
 */
export const setSession = (session: Session) => {
  if (typeof window === 'undefined') return; // SSR check
  localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
};

/**
 * Get all completed sessions from local storage.
 */
export const getCompletedSessions = (): Session[] => {
  if (typeof window === 'undefined') return []; // SSR check
  const data = localStorage.getItem(COMPLETED_SESSIONS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as Session[];
  } catch (error) {
    console.error("Error parsing completed sessions from localStorage:", error);
    return [];
  }
};

/**
 * Add a completed session to the completed sessions array.
 */
export const addCompletedSession = (session: Session) => {
  if (typeof window === 'undefined') return; // SSR check
  const completedSessions = getCompletedSessions();
  completedSessions.push(session);
  localStorage.setItem(COMPLETED_SESSIONS_KEY, JSON.stringify(completedSessions));
  
  // Clear the current session since it's now completed
  localStorage.removeItem(CURRENT_SESSION_KEY);
  
  console.log(`Session ${session.id} added to completed sessions. Total completed: ${completedSessions.length}`);
};

/**
 * Update the current session with new data.
 */
export const updateSession = (updates: Partial<Session>) => {
  const session = getCurrentSession();
  if (!session) {
    console.error("No existing session found to update.");
    return;
  }
  setSession({ ...session, ...updates });
};

/**
 * Retrieve all session data from local storage (both current and completed sessions).
 * Returns an array of all sessions ready for upload.
 */
export const getSessionData = (): Session[] => {
  if (typeof window === 'undefined') return []; // SSR check
  
  const completedSessions = getCompletedSessions();
  const currentSession = getCurrentSession();
  
  // Combine completed sessions with current session if it exists
  const allSessions = [...completedSessions];
  if (currentSession) {
    allSessions.push(currentSession);
  }
  
  // Also check for legacy format for backwards compatibility
  const legacyData = localStorage.getItem(STORAGE_KEY);
  if (legacyData) {
    try {
      const parsedData = JSON.parse(legacyData);
      const legacySessions = Array.isArray(parsedData) ? parsedData : [parsedData];
      // Add legacy sessions that aren't already in our new format
      legacySessions.forEach(session => {
        if (!allSessions.some(s => s.id === session.id)) {
          allSessions.push(session);
        }
      });
    } catch (error) {
      console.error("Error parsing legacy sessionData from localStorage:", error);
    }
  }
  
  console.log(`getSessionData(): Found ${completedSessions.length} completed + ${currentSession ? 1 : 0} current = ${allSessions.length} total sessions`);
  return allSessions;
};

/**
 * Save the array of session data objects to local storage.
 * @deprecated Use addCompletedSession instead for new sessions
 */
export const setSessionData = (data: Session[]) => {
  if (typeof window === 'undefined') return; // SSR check
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

/**
 * Clear all session data from local storage after successful upload.
 */
export const clearAllSessionData = () => {
  if (typeof window === 'undefined') return; // SSR check
  localStorage.removeItem(COMPLETED_SESSIONS_KEY);
  localStorage.removeItem(CURRENT_SESSION_KEY);
  localStorage.removeItem(STORAGE_KEY); // Also clear legacy format
  console.log("All session data cleared from localStorage");
};

/**
 * Update the session data by either merging new data into an existing session (matched via id)
 * or by appending a new session if one doesn't already exist.
 * 
 * If newData includes an id, the function will update the matching session if it exists.
 * If no matching session is found, it will push the new session into the array.
 * If no id is provided in newData, it assumes you want to update the most recent session.
 */
export const updateSessionData = (newData: Partial<Session>) => {
  // Get current single session (not array)
  const currentSession = getCurrentSession();
  
  if (newData.id) {
    // If providing an ID, create or update the session
    if (currentSession) {
      // Update existing session
      const updatedSession = { ...currentSession, ...newData };
      setSession(updatedSession);
    } else {
      // Create new session with the provided data
      const newSession = {
        id: newData.id,
        blocks: [],
        ...newData
      } as Session;
      setSession(newSession);
    }
  } else {
    // No id provided, update the current session if it exists
    if (currentSession) {
      const updatedSession = { ...currentSession, ...newData };
      setSession(updatedSession);
    } else {
      // No current session - try to update the most recent completed session
      console.log("No current session found, attempting to update most recent completed session");
      updateMostRecentSession(newData);
    }
  }
};

/**
 * Update the most recent session (either current or most recently completed).
 * This is useful when adding experimenter data after a session has been completed.
 */
export const updateMostRecentSession = (newData: Partial<Session>) => {
  if (typeof window === 'undefined') return; // SSR check
  
  // First try current session
  const currentSession = getCurrentSession();
  if (currentSession) {
    const updatedSession = { ...currentSession, ...newData };
    setSession(updatedSession);
    console.log("Updated current session with experimenter data");
    return;
  }
  
  // If no current session, update the most recent completed session
  const completedSessions = getCompletedSessions();
  if (completedSessions.length === 0) {
    console.error("No sessions found to update");
    return;
  }
  
  // Update the most recent completed session (last in array)
  const mostRecentIndex = completedSessions.length - 1;
  const updatedSession = { ...completedSessions[mostRecentIndex], ...newData };
  completedSessions[mostRecentIndex] = updatedSession;
  
  // Save updated completed sessions back to localStorage
  localStorage.setItem(COMPLETED_SESSIONS_KEY, JSON.stringify(completedSessions));
  console.log(`Updated most recent completed session with experimenter data: ${updatedSession.id}`);
};

/**
 * Set the presentedFirst field when counterbalancing order is determined.
 * This should be called immediately after the randomization occurs.
 */
export const setPresentedFirst = (presentedFirst: 'prestige' | 'dominance') => {
  const session = getCurrentSession();
  if (!session) {
    console.error("No existing session found to set presentedFirst.");
    return;
  }
  
  // Update the Session interface
  setSession({ ...session, presentedFirst });
  
  // Also update session data for syncing
  updateSession({ presentedFirst });
  
  console.log(`Counterbalancing complete: ${presentedFirst} condition presented first`);
};

/**
 * Convert Session data to format suitable for MongoDB syncing.
 * Flattens the blocks structure and extracts key data points.
 */
export const prepareSessionForSync = (session: Session): Session => {
  // Create consolidated responses object from all blocks
  const allResponses: Record<string, unknown> = {};
  
  session.blocks.forEach((block) => {
    Object.entries(block.survey).forEach(([key, value]) => {
      // Add to consolidated responses with block prefix
      allResponses[`${block.blockType}_${key}`] = value;
    });
  });

  // Find drawing data for all blocks
  const drawings = session.blocks.map(block => ({
    blockType: block.blockType,
    area: block.drawing.area,
    maxWidth: block.drawing.maxWidth,
    maxHeight: block.drawing.maxHeight,
    pngUrl: block.drawing.pngUrl,
    vignetteStartedAt: block.vignetteStartedAt,
  }));

  // Calculate total drawing area across all blocks
  const totalDrawingArea = session.blocks.reduce((sum, block) => sum + block.drawing.area, 0);

  return {
    ...session,
    // Include all survey responses for easy querying
    allResponses,
    drawings,
    totalDrawingArea,
    syncTime: new Date().toISOString(),
    syncedAt: Date.now(),
  } as Session;
};

/**
 * Get the next block type that should be completed based on current session state.
 * Returns null if all blocks are completed.
 */
export const getNextBlockType = (): BlockType | null => {
  const session = getCurrentSession();
  if (!session) return 'control'; // Start with control if no session
  
  const completedBlockTypes = session.blocks.map(block => block.blockType);
  
  // Control is always first
  if (!completedBlockTypes.includes('control')) {
    return 'control';
  }
  
  // After control, follow the randomized order
  if (session.order) {
    const [first, second] = session.order;
    
    if (!completedBlockTypes.includes(first)) {
      return first;
    }
    
    if (!completedBlockTypes.includes(second)) {
      return second;
    }
  }
  
  // All blocks completed
  return null;
};

/**
 * Check if all three blocks (control, prestige, dominance) are completed.
 */
export const isSessionComplete = (): boolean => {
  const session = getCurrentSession();
  if (!session) return false;
  
  const completedBlockTypes = session.blocks.map(block => block.blockType);
  const requiredBlocks: BlockType[] = ['control', 'prestige', 'dominance'];
  
  return requiredBlocks.every(blockType => completedBlockTypes.includes(blockType));
};

/**
 * Validate that the session has the proper structure for three blocks.
 * Useful for debugging and ensuring data integrity.
 */
export const validateSessionStructure = (session: Session): boolean => {
  try {
    // Check basic structure
    if (!session.id || !Array.isArray(session.blocks)) {
      console.error('Session missing basic structure');
      return false;
    }

    // Check that we don't have more than 3 blocks
    if (session.blocks.length > 3) {
      console.error('Session has more than 3 blocks');
      return false;
    }

    // Check for duplicate block types
    const blockTypes = session.blocks.map(b => b.blockType);
    const uniqueBlockTypes = Array.from(new Set(blockTypes));
    if (blockTypes.length !== uniqueBlockTypes.length) {
      console.error('Session has duplicate block types');
      return false;
    }

    // If we have control block, ensure order is set
    const hasControl = blockTypes.includes('control');
    if (hasControl && !session.order) {
      console.error('Session has control block but no order set');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating session structure:', error);
    return false;
  }
};

/**
 * Debug function to log current session state and block completion status.
 * Useful for troubleshooting the three-block flow.
 */
export const debugSessionState = (): void => {
  const session = getCurrentSession();
  if (!session) {
    console.log('=== SESSION DEBUG: No session found ===');
    return;
  }
  
  console.log('=== SESSION DEBUG ===');
  console.log('Session ID:', session.id);
  console.log('Order:', session.order);
  console.log('Presented First:', session.presentedFirst);
  console.log('Blocks completed:', session.blocks.length);
  
  session.blocks.forEach((block, index) => {
    console.log(`Block ${index + 1}:`, {
      blockType: block.blockType,
      vignetteStartedAt: new Date(block.vignetteStartedAt).toLocaleString(),
      surveyResponseCount: Object.keys(block.survey).length,
      drawingArea: block.drawing.area,
      drawingMaxWidth: block.drawing.maxWidth,
      drawingMaxHeight: block.drawing.maxHeight,
    });
  });
  
  const completedTypes = session.blocks.map(b => b.blockType);
  const nextBlock = getNextBlockType();
  const isComplete = isSessionComplete();
  
  console.log('Completed block types:', completedTypes);
  console.log('Next block needed:', nextBlock);
  console.log('Session complete:', isComplete);
  console.log('=== END SESSION DEBUG ===');
};

// Researcher Time Tracking Functions
const RESEARCHER_SESSIONS_KEY = "researcherSessions";
const CURRENT_RESEARCHER_KEY = "currentResearcher";
const SESSION_COUNT_KEY = "sessionCount";

/**
 * Get the current session count
 */
export const getSessionCount = (): number => {
  if (typeof window === 'undefined') return 0;
  const data = localStorage.getItem(SESSION_COUNT_KEY);
  if (!data) return 0;
  try {
    const parsed = JSON.parse(data);
    return parsed.count || 0;
  } catch (error) {
    console.error("Error parsing session count from localStorage:", error);
    return 0;
  }
};

/**
 * Increment the session count
 */
export const incrementSessionCount = (): number => {
  if (typeof window === 'undefined') return 0;
  const currentCount = getSessionCount();
  const newCount = currentCount + 1;
  localStorage.setItem(SESSION_COUNT_KEY, JSON.stringify({ count: newCount }));
  console.log(`Session count incremented to: ${newCount}`);
  return newCount;
};

/**
 * Reset the session count to 0
 */
export const resetSessionCount = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_COUNT_KEY, JSON.stringify({ count: 0 }));
  console.log("Session count reset to 0");
};

/**
 * Get the current signed-in researcher session
 */
export const getCurrentResearcher = (): ResearcherSession | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(CURRENT_RESEARCHER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as ResearcherSession;
  } catch (error) {
    console.error("Error parsing current researcher from localStorage:", error);
    return null;
  }
};

/**
 * Sign in a researcher
 */
export const signInResearcher = (researcherName: string): string => {
  if (typeof window === 'undefined') return '';
  
  const now = getESTTimestamp(); // Use EST timestamp
  const sessionId = `researcher_${now}`;
  const today = getESTDate(); // Use EST date
  
  const researcherSession: ResearcherSession = {
    id: sessionId,
    researcherName,
    signInTime: now,
    date: today
  };
  
  localStorage.setItem(CURRENT_RESEARCHER_KEY, JSON.stringify(researcherSession));
  console.log(`Researcher ${researcherName} signed in at ${formatESTDateTime(now)} EST`);
  
  return sessionId;
};

/**
 * Sign out the current researcher and sync to Supabase
 */
export const signOutResearcher = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  const currentResearcher = getCurrentResearcher();
  if (!currentResearcher) {
    console.log("No researcher currently signed in");
    return;
  }
  
  // Add sign out time in EST
  const signOutTime = getESTTimestamp();
  currentResearcher.signOutTime = signOutTime;
  
  // Add the current session count to the researcher session
  const sessionsCompleted = getSessionCount();
  (currentResearcher as ResearcherSession & { sessionsCompleted: number }).sessionsCompleted = sessionsCompleted;
  
  const duration = signOutTime - currentResearcher.signInTime;
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  
  // Save to local storage first (backup)
  const allSessions = getResearcherSessions();
  allSessions.push(currentResearcher);
  localStorage.setItem(RESEARCHER_SESSIONS_KEY, JSON.stringify(allSessions));
  
  // Try to sync to Supabase
  try {
    const response = await fetch('/api/researcher', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentResearcher),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Researcher session synced to Supabase:', result.message);
    } else {
      console.error('Failed to sync to Supabase, but saved locally');
    }
  } catch (error) {
    console.error('Error syncing to Supabase:', error);
    console.log('Session saved locally as backup');
  }
  
  // Clear current researcher and reset session count
  localStorage.removeItem(CURRENT_RESEARCHER_KEY);
  resetSessionCount();
  
  console.log(`Researcher ${currentResearcher.researcherName} signed out. Session duration: ${hours}h ${minutes}m, Sessions completed: ${sessionsCompleted}`);
};

/**
 * Get all researcher sessions
 */
export const getResearcherSessions = (): ResearcherSession[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(RESEARCHER_SESSIONS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as ResearcherSession[];
  } catch (error) {
    console.error("Error parsing researcher sessions from localStorage:", error);
    return [];
  }
};

/**
 * Export researcher time tracking data to JSON string for download
 */
export const exportResearcherData = (): string => {
  const sessions = getResearcherSessions();
  const currentResearcher = getCurrentResearcher();
  
  const allSessions = [...sessions];
  if (currentResearcher) {
    allSessions.push({
      ...currentResearcher,
      signOutTime: currentResearcher.signOutTime || Date.now(),
      note: currentResearcher.signOutTime ? "" : "Currently signed in"
    });
  }
  
  // Convert to CSV-like format for easy Excel import
  const csvData = allSessions.map(session => {
    const duration = (session.signOutTime || Date.now()) - session.signInTime;
    const hours = (duration / (1000 * 60 * 60)).toFixed(2);
    
    return {
      researcherName: session.researcherName,
      date: session.date,
      signInTime: new Date(session.signInTime).toLocaleString(),
      signOutTime: session.signOutTime ? new Date(session.signOutTime).toLocaleString() : "Still signed in",
      durationHours: hours,
      sessionId: session.id
    };
  });
  
  return JSON.stringify(csvData, null, 2);
};

/**
 * Clear all researcher session data
 */
export const clearResearcherData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RESEARCHER_SESSIONS_KEY);
  localStorage.removeItem(CURRENT_RESEARCHER_KEY);
  console.log("All researcher session data cleared");
}; 