/**
 * Calculate progress percentage based on current page in the session flow
 * Excludes draw pages from progress calculation
 */

import { getCurrentSession } from './sessionData';

export type ProgressPage =
  | 'consent'
  | 'exampleDrawing'
  | 'prepBaseline'
  | 'information'
  | 'prepControl'      // Control block
  | 'vignetteControl'  // Control block vignette
  | 'surveyControl'    // Control block survey
  | 'prepFirst'        // First experimental block
  | 'vignetteFirst'    // First experimental block vignette
  | 'surveyFirst'      // First experimental block survey
  | 'prepSecond'       // Second experimental block
  | 'vignetteSecond'   // Second experimental block vignette
  | 'surveySecond'     // Second experimental block survey
  | 'prepThird'        // Third experimental block
  | 'vignetteThird'    // Third experimental block vignette
  | 'surveyThird'      // Third experimental block survey
  | 'demographics'
  | 'debriefing';

// Total pages in participant flow (excluding draw pages)
const TOTAL_PAGES = 18;

// Progress mapping for each page
const PAGE_PROGRESS: Record<ProgressPage, number> = {
  consent: 1,
  exampleDrawing: 2,
  prepBaseline: 3,
  information: 4,
  prepControl: 5,
  vignetteControl: 6,
  surveyControl: 7,
  prepFirst: 8,
  vignetteFirst: 9,
  surveyFirst: 10,
  prepSecond: 11,
  vignetteSecond: 12,
  surveySecond: 13,
  prepThird: 14,
  vignetteThird: 15,
  surveyThird: 16,
  demographics: 17,
  debriefing: 18
};

/**
 * Get progress percentage for a given page
 * @param page - Current page identifier
 * @returns Progress percentage (0-100)
 */
export function getProgressPercentage(page: ProgressPage): number {
  const pageNumber = PAGE_PROGRESS[page];
  return Math.round((pageNumber / TOTAL_PAGES) * 100);
}

/**
 * Get progress value for shadcn Progress component (0-100)
 * @param page - Current page identifier
 * @returns Progress value for the Progress component
 */
export function getProgressValue(page: ProgressPage): number {
  return getProgressPercentage(page);
}

/**
 * Get progress for a condition-specific page (prestige, dominance, or lowStatus) based on session state
 * @param blockType - 'prestige', 'dominance', or 'lowStatus'
 * @param pageType - 'prep', 'vignette', or 'survey'
 * @returns Progress value (0-100)
 */
export function getConditionProgress(blockType: 'prestige' | 'dominance' | 'lowStatus', pageType: 'prep' | 'vignette' | 'survey'): number {
  const session = getCurrentSession();
  if (!session || !session.sessionOrder) return 0;
  
  // Find which position this blockType is in the session order
  const blockPosition = session.sessionOrder.indexOf(blockType);
  if (blockPosition === -1) return 0;
  
  // Map position to progress page
  const progressPositions = ['First', 'Second', 'Third'] as const;
  const progressPosition = progressPositions[blockPosition];
  if (!progressPosition) return 0;
  
  // Get the appropriate progress value
  switch (pageType) {
    case 'prep': return getProgressValue(`prep${progressPosition}` as ProgressPage);
    case 'vignette': return getProgressValue(`vignette${progressPosition}` as ProgressPage);
    case 'survey': return getProgressValue(`survey${progressPosition}` as ProgressPage);
  }
  
  return 0; // Fallback
}

/**
 * Get progress for survey pages based on their specific type
 */
export function getSurveyProgress(surveyType: 'prestige' | 'dominance' | 'lowStatus'): number {
  return getConditionProgress(surveyType, 'survey');
} 