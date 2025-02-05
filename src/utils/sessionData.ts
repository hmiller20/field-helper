export interface SessionData {
  sessionId: string;
  vignette?: string;
  conditionValue?: number;
  experimenter?: string;
  sessionNotes?: string;
  surveyResponses?: Record<string, unknown>;
  drawingData?: Record<string, unknown>;
}

const STORAGE_KEY = "sessionData";

/**
 * Retrieve the session data from local storage.
 */
export const getSessionData = (): SessionData | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

/**
 * Save the full session data object to local storage.
 */
export const setSessionData = (data: SessionData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

/**
 * Update the session data by merging new data into the existing session object.
 * Creates the session object if it doesn't exist already.
 */
export const updateSessionData = (newData: Partial<SessionData>) => {
  const currentData = getSessionData();
  const updatedData = { ...currentData, ...newData } as SessionData;
  setSessionData(updatedData);
}; 