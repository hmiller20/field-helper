export type BlockType = 'control' | 'prestige' | 'dominance';

export interface Block {
  blockType: BlockType;
  vignetteStartedAt: number;
  survey: Record<string, string | number>;
  drawing: { pngUrl: string; area: number; };
}

export interface Session {
  id: string;
  order: ['prestige','dominance'] | ['dominance','prestige']; // set once
  blocks: Block[];
  demographics?: Record<string, string>;
  syncedAt?: number;
  // Temporary fields used during the session
  tempVignetteStart?: number;
  tempSurvey?: Record<string, string | number>;
}

export interface SessionData {
  sessionId: string;
  vignette?: string;
  conditionValue?: number;
  experimenter?: string;
  sessionNotes?: string;
  surveyResponses?: Record<string, unknown>;
  drawingData?: {
    totalArea: number;
    maxWidth: number;
    maxHeight: number;
    drawingImageUrl?: string;  // URL to the stored drawing image
  };
  syncTime?: string;
}

const STORAGE_KEY = "session";

/**
 * Get the current session from local storage.
 * Returns null if no session exists.
 */
export const getCurrentSession = (): Session | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as Session;
  } catch (error) {
    console.error("Error parsing session from localStorage:", error);
    return null;
  }
};

/**
 * Save the session to local storage.
 */
export const setSession = (session: Session) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
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
 * Retrieve the array of session data from local storage.
 * If the stored data is a single object, it will be wrapped in an array.
 */
export const getSessionData = (): SessionData[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return [];
  }
  try {
    const parsedData = JSON.parse(data);
    return Array.isArray(parsedData) ? parsedData : [parsedData];
  } catch (error) {
    console.error("Error parsing sessionData from localStorage:", error);
    return [];
  }
};

/**
 * Save the array of session data objects to local storage.
 */
export const setSessionData = (data: SessionData[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

/**
 * Update the session data by either merging new data into an existing session (matched via sessionId)
 * or by appending a new session if one doesn't already exist.
 * 
 * If newData includes a sessionId, the function will update the matching session if it exists.
 * If no matching session is found, it will push the new session into the array.
 * If no sessionId is provided in newData, it assumes you want to update the most recent session.
 */
export const updateSessionData = (newData: Partial<SessionData>) => {
  const sessions = getSessionData();

  if (newData.sessionId) {
    const index = sessions.findIndex(session => session.sessionId === newData.sessionId);
    if (index !== -1) {
      // Merge with the existing session
      sessions[index] = { ...sessions[index], ...newData };
    } else {
      // Create a new session entry if one with this sessionId doesn't exist
      sessions.push(newData as SessionData);
    }
  } else {
    // No sessionId provided, update the last (most recent) session if it exists.
    if (sessions.length > 0) {
      sessions[sessions.length - 1] = { ...sessions[sessions.length - 1], ...newData };
    } else {
      console.error("No existing session found to update.");
    }
  }
  
  setSessionData(sessions);
}; 