export type BlockType = 'control' | 'prestige' | 'dominance';

export interface Block {
  blockType: BlockType;
  vignetteStartedAt: number;
  survey: Record<string, string | number>;
  drawing: { pngUrl: string; area: number; };
}

export interface Session {
  // Core session identification
  id: string;
  sessionId?: string; // Legacy field for backward compatibility
  
  // Experimental design fields
  order: ['prestige','dominance'] | ['dominance','prestige']; // set once
  presentedFirst: 'prestige' | 'dominance'; // tracks which condition came first
  blocks: Block[];
  
  // Additional data fields (from old SessionData interface)
  experimenter?: string;
  sessionNotes?: string;
  demographics?: Record<string, string>;
  controlResponses?: Record<string, unknown>; // Flattened survey data from control condition
  dominanceResponses?: Record<string, unknown>; // Survey responses from dominance condition
  prestigeResponses?: Record<string, unknown>; // Survey responses from prestige condition
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
export const getSessionData = (): Session[] => {
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
export const setSessionData = (data: Session[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
  const sessions = getSessionData();

  if (newData.id) {
    const index = sessions.findIndex(session => session.id === newData.id);
    if (index !== -1) {
      // Merge with the existing session
      sessions[index] = { ...sessions[index], ...newData };
    } else {
      // Create a new session entry if one with this id doesn't exist
      sessions.push(newData as Session);
    }
  } else {
    // No id provided, update the last (most recent) session if it exists.
    if (sessions.length > 0) {
      sessions[sessions.length - 1] = { ...sessions[sessions.length - 1], ...newData };
    } else {
      console.error("No existing session found to update.");
    }
  }
  
  setSessionData(sessions);
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
      allResponses[`${block.blockType}_${key}`] = value;
    });
  });

  // Find drawing data (you might want to include all drawings or just specific ones)
  const drawings = session.blocks.map(block => ({
    blockType: block.blockType,
    area: block.drawing.area,
    pngUrl: block.drawing.pngUrl,
  }));

  return {
    ...session,
    // Include all survey responses for easy querying
    allResponses,
    drawings,
    syncTime: new Date().toISOString(),
  } as Session;
}; 