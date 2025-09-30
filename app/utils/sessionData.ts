import { NameColor, NAME_COLORS } from "./colors";

export type BlockType = 'prestige' | 'dominance' | 'lowStatus' | 'control';

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

export interface BaselineDrawing {
  area: number;
  maxWidth: number;
  maxHeight: number;
  verticality: number;
  pngUrl: string;
  silhouettePngUrl?: string;
}

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
    // New silhouette-based metrics
    silhouettePngUrl?: string; // processed silhouette image
  };
}

export interface Session {
  // Core session identification
  id: string; // UUID for internal use
  sessionId?: string; // Human-readable chronological ID (e.g., "1", "2", "test")
  
  // Baseline drawing (separate from experimental blocks)
  baselineDrawing?: BaselineDrawing;
  
  // Experimental design fields
  sessionOrder: BlockType[]; // Randomized order of the 3 experimental conditions
  blocks: Block[]; // Contains exactly 3 blocks for experimental conditions
  order?: ('prestige' | 'dominance')[]; // For 2-condition substudy (prestige/dominance only)
  
  // Additional data fields (from old SessionData interface)
  experimenter?: string;
  sessionNotes?: string;
  demographics?: Record<string, string>;

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

  // Name color
  nameColors?: { John: NameColor, Bill: NameColor, Mike: NameColor };
  
  // Character-condition assignments (each condition gets one character)
  characterAssignments?: {
    prestige: 'John' | 'Bill' | 'Mike';
    dominance: 'John' | 'Bill' | 'Mike';
    lowStatus: 'John' | 'Bill' | 'Mike';
  };
  
  // Drawing violation tracking
  smallViolations?: number;
  largeViolations?: number;
  
  // Session quality flags
  sessionGood?: boolean;
  sessionTest?: boolean;

  // Counterbalancing tracking
  presentedFirst?: 'prestige' | 'dominance' | 'lowStatus' | 'control';
}

const STORAGE_KEY = "session";
const COMPLETED_SESSIONS_KEY = "completedSessions";
const CURRENT_SESSION_KEY = "currentSession";

/**
 * Validate and sanitize session data to ensure it has proper structure
 */
export const validateAndSanitizeSession = (session: unknown): Session | null => {
  try {
    if (!session || typeof session !== 'object') {
      console.warn("Invalid session: not an object");
      return null;
    }

    const sessionObj = session as Record<string, unknown>;

    // Ensure required fields exist
    if (!sessionObj.id) {
      console.warn("Invalid session: missing id");
      return null;
    }

    // Build sanitized session with required fields
    const sanitized: Session = {
      id: sessionObj.id as string,
      blocks: Array.isArray(sessionObj.blocks) ? sessionObj.blocks : [],
      sessionOrder: Array.isArray(sessionObj.sessionOrder) ? sessionObj.sessionOrder : [],
      smallViolations: typeof sessionObj.smallViolations === 'number' ? sessionObj.smallViolations : 0,
      largeViolations: typeof sessionObj.largeViolations === 'number' ? sessionObj.largeViolations : 0,
      sessionGood: Boolean(sessionObj.sessionGood),
      sessionTest: Boolean(sessionObj.sessionTest)
    };

    // Add optional fields only if they exist
    if (sessionObj.sessionId) sanitized.sessionId = sessionObj.sessionId as string;
    if (sessionObj.baselineDrawing) sanitized.baselineDrawing = sessionObj.baselineDrawing as BaselineDrawing;
    if (sessionObj.experimenter) sanitized.experimenter = sessionObj.experimenter as string;
    if (sessionObj.sessionNotes) sanitized.sessionNotes = sessionObj.sessionNotes as string;
    if (sessionObj.demographics) sanitized.demographics = sessionObj.demographics as Record<string, string>;
    if (sessionObj.drawingData) sanitized.drawingData = sessionObj.drawingData as Session['drawingData'];
    if (sessionObj.syncedAt) sanitized.syncedAt = sessionObj.syncedAt as number;
    if (sessionObj.syncTime) sanitized.syncTime = sessionObj.syncTime as string;
    if (sessionObj.tempVignetteStart) sanitized.tempVignetteStart = sessionObj.tempVignetteStart as number;
    if (sessionObj.tempSurvey) sanitized.tempSurvey = sessionObj.tempSurvey as Record<string, string | number>;
    if (sessionObj.nameColors) sanitized.nameColors = sessionObj.nameColors as Session['nameColors'];
    if (sessionObj.characterAssignments) sanitized.characterAssignments = sessionObj.characterAssignments as Session['characterAssignments'];
    if (sessionObj.presentedFirst) sanitized.presentedFirst = sessionObj.presentedFirst as Session['presentedFirst'];
    if (sessionObj.order) sanitized.order = sessionObj.order as Session['order'];

    return sanitized;
  } catch (error) {
    console.error("Error validating/sanitizing session:", error);
    return null;
  }
};


/**
 * Get the current active session from local storage.
 * Returns null if no session exists or if localStorage is not available (SSR).
 */
export const getCurrentSession = (): Session | null => {
  if (typeof window === 'undefined') return null; // SSR check
  const data = localStorage.getItem(CURRENT_SESSION_KEY);
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return validateAndSanitizeSession(parsed);
  } catch (error) {
    console.error("Error parsing current session from localStorage:", error);
    // Clear corrupted data
    localStorage.removeItem(CURRENT_SESSION_KEY);
    return null;
  }
};

/**
 * Recover from corrupted localStorage state
 */
export const recoverFromCorruptedState = (): void => {
  if (typeof window === 'undefined') return;

  console.warn("Attempting to recover from corrupted localStorage state");

  try {
    // Clear potentially corrupted keys
    const keysToCheck = [CURRENT_SESSION_KEY, COMPLETED_SESSIONS_KEY, STORAGE_KEY];

    keysToCheck.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          JSON.parse(data); // Test if it's valid JSON
        }
      } catch {
        console.warn(`Removing corrupted key: ${key}`);
        localStorage.removeItem(key);
      }
    });

    // Ensure essential keys exist with valid defaults
    if (!localStorage.getItem(COMPLETED_SESSIONS_KEY)) {
      localStorage.setItem(COMPLETED_SESSIONS_KEY, JSON.stringify([]));
    }

    console.log("State recovery completed");
  } catch (error) {
    console.error("Failed to recover from corrupted state:", error);
  }
};

/**
 * Initialize localStorage state safely on app startup
 */
export const initializeAppState = (): void => {
  if (typeof window === 'undefined') return;

  try {
    // Test if localStorage is working
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');

    // Check for corrupted state and recover if needed
    const currentSession = localStorage.getItem(CURRENT_SESSION_KEY);
    if (currentSession) {
      try {
        const parsed = JSON.parse(currentSession);
        validateAndSanitizeSession(parsed);
      } catch {
        recoverFromCorruptedState();
      }
    }

    console.log("App state initialized successfully");
  } catch (error) {
    console.error("Failed to initialize app state:", error);
    // If localStorage is completely broken, log error but continue
  }
};

/**
 * Save the current active session to local storage.
 */
export const setSession = (session: Session) => {
  if (typeof window === 'undefined') return; // SSR check

  try {
    // Validate session before saving
    const validatedSession = validateAndSanitizeSession(session);
    if (validatedSession) {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(validatedSession));
    } else {
      console.error("Attempted to save invalid session data");
    }
  } catch (error) {
    console.error("Failed to save session:", error);
    recoverFromCorruptedState();
  }
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
 * Returns true if successful, false if it failed.
 */
export const addCompletedSession = (session: Session): boolean => {
  if (typeof window === 'undefined') return false; // SSR check

  try {
    const completedSessions = getCompletedSessions();
    completedSessions.push(session);

    // Try to stringify first to catch errors before writing
    const serialized = JSON.stringify(completedSessions);
    localStorage.setItem(COMPLETED_SESSIONS_KEY, serialized);

    // Clear the current session since it's now completed
    localStorage.removeItem(CURRENT_SESSION_KEY);

    console.log(`Session ${session.id} added to completed sessions. Total completed: ${completedSessions.length}`);
    return true;
  } catch (error) {
    console.error('Failed to add completed session:', error);
    // Check if it's a quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded! Cannot save session.');
    }
    return false;
  }
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
 * Set which condition was presented first for counterbalancing tracking.
 */
export const setPresentedFirst = (condition: 'prestige' | 'dominance' | 'lowStatus' | 'control') => {
  const session = getCurrentSession();
  if (!session) {
    console.error("No existing session found to set presentedFirst.");
    return;
  }
  setSession({ ...session, presentedFirst: condition });
  console.log(`Set presentedFirst to: ${condition}`);
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
      // Create new session with the provided data and ensure violation counts are initialized
      const newSession = {
        id: newData.id,
        blocks: [],
        sessionOrder: [],
        smallViolations: 0,
        largeViolations: 0,
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
 * Generate a randomized session order for the three experimental conditions.
 * Returns one of the 6 possible orderings.
 */
export const generateSessionOrder = (): BlockType[] => {
  const allOrderings = [
    ['prestige', 'dominance', 'lowStatus'],
    ['prestige', 'lowStatus', 'dominance'],
    ['dominance', 'prestige', 'lowStatus'],
    ['dominance', 'lowStatus', 'prestige'],
    ['lowStatus', 'prestige', 'dominance'],
    ['lowStatus', 'dominance', 'prestige']
  ] as BlockType[][];
  
  const randomIndex = Math.floor(Math.random() * allOrderings.length);
  return allOrderings[randomIndex];
};

/**
 * Set the session order when counterbalancing is determined.
 * This should be called after the baseline drawing is completed.
 */
export const setSessionOrder = (sessionOrder: BlockType[]) => {
  const session = getCurrentSession();
  if (!session) {
    console.error("No existing session found to set sessionOrder.");
    return;
  }
  
  // Update the Session interface
  setSession({ ...session, sessionOrder });
  
  console.log(`Session order set: [${sessionOrder.join(', ')}]`);
};

/**
 * Save the baseline drawing data to the current session.
 */
export const saveBaselineDrawing = (baselineDrawing: BaselineDrawing) => {
  const session = getCurrentSession();
  if (!session) {
    console.error("No existing session found to save baseline drawing.");
    return;
  }
  
  setSession({ ...session, baselineDrawing });
  console.log(`Baseline drawing saved with area: ${baselineDrawing.area}`);
};


/**
 * Get the next block type that should be completed based on current session state.
 * Returns null if all blocks are completed.
 */
export const getNextBlockType = (): BlockType | null => {
  const session = getCurrentSession();
  if (!session) return null;
  
  if (!session.sessionOrder) return null;
  
  const completedBlockTypes = session.blocks.map(block => block.blockType);
  
  // Follow the randomized session order
  for (const blockType of session.sessionOrder) {
    if (!completedBlockTypes.includes(blockType)) {
      return blockType;
    }
  }
  
  // All blocks completed
  return null;
};

/**
 * Check if baseline and all three experimental blocks are completed.
 */
export const isSessionComplete = (): boolean => {
  const session = getCurrentSession();
  if (!session) return false;
  
  // Check if baseline is completed
  if (!session.baselineDrawing) return false;
  
  // Check if all experimental blocks are completed
  const completedBlockTypes = session.blocks.map(block => block.blockType);
  const requiredBlocks: BlockType[] = ['prestige', 'dominance', 'lowStatus'];
  
  return requiredBlocks.every(blockType => completedBlockTypes.includes(blockType));
};


/**
 * Debug function to log current session state and block completion status.
 * Useful for troubleshooting the baseline + three experimental block flow.
 */
export const debugSessionState = (): void => {
  const session = getCurrentSession();
  if (!session) {
    console.log('=== SESSION DEBUG: No session found ===');
    return;
  }
  
  console.log('=== SESSION DEBUG ===');
  console.log('Session ID:', session.id);
  console.log('Baseline Drawing:', session.baselineDrawing ? 'Completed' : 'Not completed');
  console.log('Session Order:', session.sessionOrder);
  console.log('Experimental blocks completed:', session.blocks.length);
  
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

// Chronological Session ID Management
const NEXT_SESSION_ID_KEY = "nextSessionId";

/**
 * Get the next available chronological session ID
 */
export const getNextSessionId = (): number => {
  if (typeof window === 'undefined') return 1;
  const data = localStorage.getItem(NEXT_SESSION_ID_KEY);
  if (!data) return 1;
  try {
    const parsed = JSON.parse(data);
    return parsed.nextId || 1;
  } catch (error) {
    console.error("Error parsing next session ID from localStorage:", error);
    return 1;
  }
};

/**
 * Generate and reserve the next chronological session ID
 * Returns the ID and increments the counter for future sessions
 */
export const generateChronologicalSessionId = (): string => {
  if (typeof window === 'undefined') return '1';
  
  const nextId = getNextSessionId();
  const sessionId = nextId.toString();
  
  // Increment for next session
  localStorage.setItem(NEXT_SESSION_ID_KEY, JSON.stringify({ nextId: nextId + 1 }));
  console.log(`Generated chronological session ID: ${sessionId}, next ID will be: ${nextId + 1}`);
  
  return sessionId;
};

/**
 * Generate a test session ID without incrementing the counter
 */
export const generateTestSessionId = (): string => {
  console.log("Generated test session ID: test");
  return "test";
};

/**
 * Reset the chronological session ID counter
 */
export const resetChronologicalSessionIds = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NEXT_SESSION_ID_KEY, JSON.stringify({ nextId: 1 }));
  console.log("Chronological session ID counter reset to 1");
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
 * Clear all researcher session data
 */
export const clearResearcherData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RESEARCHER_SESSIONS_KEY);
  localStorage.removeItem(CURRENT_RESEARCHER_KEY);
  console.log("All researcher session data cleared");
}; 

export function assignNameColors() {
  // Clear any existing name colors to ensure fresh randomization
  localStorage.removeItem("nameColors");
  
  // Randomly shuffle the three colors among the three names
  const colors: NameColor[] = ["blue", "orange", "green"];
  
  // Fisher-Yates shuffle
  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }
  
  const nameColors = {
    John: colors[0],
    Bill: colors[1],
    Mike: colors[2]
  };
  
  // Store in localStorage for backward compatibility
  localStorage.setItem("nameColors", JSON.stringify(nameColors));
  
  // Also store in current session if it exists
  const session = getCurrentSession();
  if (session) {
    updateSession({ nameColors });
  }
}

/**
 * Assign characters to experimental conditions randomly.
 * Each condition gets exactly one character, and each character appears in exactly one condition.
 */
export function assignCharacterConditions() {
  // First check if assignments already exist to prevent re-randomization
  const existingSession = getCurrentSession();
  if (existingSession?.characterAssignments) {
    console.log("Character assignments already exist:", existingSession.characterAssignments);
    return existingSession.characterAssignments;
  }
  
  const characters = ["John", "Bill", "Mike"] as const;
  
  // Randomly shuffle characters
  const shuffledCharacters = [...characters];
  for (let i = shuffledCharacters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledCharacters[i], shuffledCharacters[j]] = [shuffledCharacters[j], shuffledCharacters[i]];
  }
  
  // Assign one character to each condition
  const characterAssignments = {
    prestige: shuffledCharacters[0],
    dominance: shuffledCharacters[1],
    lowStatus: shuffledCharacters[2]
  };
  
  // Store in current session
  const session = getCurrentSession();
  if (session) {
    updateSession({ characterAssignments });
    console.log("NEW character assignments created and stored:", characterAssignments);
  } else {
    console.error("No session found when trying to store character assignments");
  }
  
  return characterAssignments;
}

/**
 * Get the character assigned to a specific experimental condition
 */
export function getCharacterForCondition(condition: 'prestige' | 'dominance' | 'lowStatus'): 'John' | 'Bill' | 'Mike' {
  const session = getCurrentSession();
  
  if (!session) {
    console.error(`No session found when getting character for condition: ${condition}`);
    return 'John'; // fallback
  }
  
  if (!session.characterAssignments) {
    console.error(`No character assignments found for condition: ${condition}. Session:`, session);
    console.error("Attempting to create character assignments...");
    
    // Try to create assignments if they're missing
    const assignments = assignCharacterConditions();
    return assignments[condition];
  }
  
  const character = session.characterAssignments[condition];
  console.log(`Getting character for condition ${condition}: ${character}`);
  return character;
}

/**
 * Initialize or reset drawing violation counts for a new session
 */
export function initializeViolationCounts() {
  const session = getCurrentSession();
  if (session) {
    // Explicitly set violation counts to 0 as integers
    const updatedSession = {
      ...session,
      smallViolations: 0,
      largeViolations: 0
    };
    setSession(updatedSession);
    console.log("Violation counts initialized: smallViolations=0, largeViolations=0");
  }
}

/**
 * Increment the small drawing violation count
 */
export function incrementSmallViolation() {
  const session = getCurrentSession();
  if (session) {
    const currentCount = session.smallViolations || 0;
    updateSession({ smallViolations: currentCount + 1 });
    console.log(`Small drawing violation recorded. Total count: ${currentCount + 1}`);
  }
}

/**
 * Increment the large drawing violation count
 */
export function incrementLargeViolation() {
  const session = getCurrentSession();
  if (session) {
    const currentCount = session.largeViolations || 0;
    updateSession({ largeViolations: currentCount + 1 });
    console.log(`Large drawing violation recorded. Total count: ${currentCount + 1}`);
  }
}

export function getNameColor(name: "John" | "Bill" | "Mike"): string {
  // SSR check - return default color during server-side rendering
  if (typeof window === 'undefined') {
    return "#000"; // Default black color for SSR
  }
  
  // First try to get from current session
  const session = getCurrentSession();
  if (session?.nameColors?.[name]) {
    return NAME_COLORS[session.nameColors[name]];
  }
  
  // Fall back to localStorage for backward compatibility
  try {
    const colors = JSON.parse(localStorage.getItem("nameColors") || "{}");
    return NAME_COLORS[colors[name] as NameColor] || "#000";
  } catch (error) {
    console.error("Error parsing name colors from localStorage:", error);
    return "#000";
  }
}

export function flattenSessionForSupabase(session: Session): Record<string, string | number | boolean | null> {
  // Ensure violation fields are always integers
  const smallViolations = typeof session.smallViolations === 'number' ? session.smallViolations : 0;
  const largeViolations = typeof session.largeViolations === 'number' ? session.largeViolations : 0;
  
  console.log(`Session ${session.id}: smallViolations=${smallViolations}, largeViolations=${largeViolations}`);
  
  // Auto-populate session_notes based on flags
  let sessionNotes = session.sessionNotes || null;
  if (session.sessionTest) {
    sessionNotes = sessionNotes ? `Test - ${sessionNotes}` : 'Test';
  } else if (session.sessionGood) {
    sessionNotes = sessionNotes ? `All good - ${sessionNotes}` : 'All good';
  }
  
  const flat: Record<string, string | number | boolean | null> = {
    session_order: session.sessionOrder ? session.sessionOrder.join(',') : null,
    experimenter: session.experimenter || null,
    session_notes: sessionNotes,
    session_id: session.sessionId || null,
    session_good: session.sessionGood || false,
    session_test: session.sessionTest || false,
    demographics_age: session.demographics?.age ? parseInt(session.demographics.age, 10) : null,
    demographics_gender: session.demographics?.gender || null,
    demographics_previous_participation: session.demographics?.previousParticipation || null,
    name_color_john: session.nameColors?.John || null,
    name_color_bill: session.nameColors?.Bill || null,
    name_color_mike: session.nameColors?.Mike || null,
    character_prestige: session.characterAssignments?.prestige || null,
    character_dominance: session.characterAssignments?.dominance || null,
    character_lowstatus: session.characterAssignments?.lowStatus || null,
    small_violations: smallViolations,
    large_violations: largeViolations,
    synced_at: session.syncedAt || null,
    sync_time: session.syncTime || null,
    // Baseline drawing data
    baseline_area: session.baselineDrawing?.area ?? null,
    baseline_max_width: session.baselineDrawing?.maxWidth ?? null,
    baseline_max_height: session.baselineDrawing?.maxHeight ?? null,
    baseline_verticality: session.baselineDrawing?.verticality ?? null,
    baseline_png_url: session.baselineDrawing?.pngUrl ?? null,
    baseline_silhouette_png_url: session.baselineDrawing?.silhouettePngUrl ?? null,
    // id will be generated by Supabase uuid_generate_v4()
  };

  // Define survey items for experimental blocks (all have same survey structure)
  const surveyItems = ["dommanip1", "dommanip2", "premanip1", "premanip2", "statusmanip1", "statusmanip2", "attncheck6", "attncheck2"];

  // For each experimental block, assign to block1, block2, block3 based on order in session.blocks
  session.blocks.forEach((block: Block, i: number) => {
    const idx = i + 1; // 1-based for block1, block2, block3
    flat[`block${idx}_type`] = block.blockType;
    flat[`block${idx}_area`] = block.drawing?.area ?? null;
    flat[`block${idx}_max_width`] = block.drawing?.maxWidth ?? null;
    flat[`block${idx}_max_height`] = block.drawing?.maxHeight ?? null;
    flat[`block${idx}_verticality`] = block.drawing?.verticality ?? null;
    flat[`block${idx}_png_url`] = block.drawing?.pngUrl ?? null;
    // Silhouette PNG URL
    flat[`block${idx}_silhouette_png_url`] = block.drawing?.silhouettePngUrl ?? null;
    
    surveyItems.forEach((item: string) => {
      // The survey keys in your data are like domManip1_c, domManip1_d, domManip1_p, etc.
      // We'll match any key that starts with the item (case-insensitive)
      const surveyKey = Object.keys(block.survey).find(
        k => k.toLowerCase().startsWith(item.toLowerCase())
      );
      // Ensure column name is all lowercase to match Supabase schema
      const columnName = `block${idx}_survey_${item.toLowerCase()}`;
      const value = surveyKey ? block.survey[surveyKey] : null;
      
      flat[columnName] = value;
    });
  });

  return flat;
}

/**
 * Sync sessions to Supabase using the new API route
 */
export const syncSessionsToSupabase = async (sessions?: Session[]): Promise<{ success: boolean; message?: string; errors?: unknown[] }> => {
  try {
    // Use provided sessions or get all sessions from localStorage
    const sessionsToSync = sessions || getSessionData();
    
    if (sessionsToSync.length === 0) {
      return { success: true, message: 'No sessions to sync' };
    }

    console.log(`Syncing ${sessionsToSync.length} session(s) to Supabase...`);

    const response = await fetch('/api/sync-supabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionsToSync),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Supabase sync successful:', result.message);
      return { success: true, message: result.message };
    } else {
      console.error('Supabase sync failed:', result.error);
      return { success: false, message: result.error, errors: result.errors };
    }
  } catch (error) {
    console.error('Error syncing to Supabase:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Safely color names in text with SSR support.
 * Returns the original text during SSR and colored text in the browser.
 */
export function safeColorNamesInText(text: string): string {
  // During SSR, return the original text without coloring
  if (typeof window === 'undefined') {
    return text;
  }
  
  // In the browser, apply coloring
  return text
    .replace(/John/g, `<span style="color: ${getNameColor("John")}; font-weight: bold;">John</span>`)
    .replace(/Bill/g, `<span style="color: ${getNameColor("Bill")}; font-weight: bold;">Bill</span>`)
    .replace(/Mike/g, `<span style="color: ${getNameColor("Mike")}; font-weight: bold;">Mike</span>`);
} 