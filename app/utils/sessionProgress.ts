/**
 * Calculate progress percentage based on current page in the session flow
 * Excludes draw pages from progress calculation
 */

import { getCurrentSession } from './sessionData';

export type ProgressPage = 
  | 'consent'
  | 'exampleDrawing'
  | 'prepControl'
  | 'vignetteControl'
  | 'surveyControl'
  | 'prepSecond'      // Second block (prestige or dominance)
  | 'vignetteSecond'  // Second block vignette
  | 'surveySecond'    // Second block survey
  | 'prepThird'       // Third block (opposite of second)
  | 'vignetteThird'   // Third block vignette
  | 'surveyThird'     // Third block survey
  | 'demographics'
  | 'debriefing';

// Total pages in participant flow (excluding draw pages)
const TOTAL_PAGES = 13;

// Progress mapping for each page
const PAGE_PROGRESS: Record<ProgressPage, number> = {
  consent: 1,
  exampleDrawing: 2,
  prepControl: 3,
  vignetteControl: 4,
  surveyControl: 5,
  prepSecond: 6,
  vignetteSecond: 7,
  surveySecond: 8,
  prepThird: 9,
  vignetteThird: 10,
  surveyThird: 11,
  demographics: 12,
  debriefing: 13
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
 * Get progress for a condition-specific page (control, prestige or dominance) based on session state
 * @param blockType - 'control', 'prestige' or 'dominance'
 * @param pageType - 'prep', 'vignette', or 'survey'
 * @returns Progress value (0-100)
 */
export function getConditionProgress(blockType: 'control' | 'prestige' | 'dominance', pageType: 'prep' | 'vignette' | 'survey'): number {
  // Handle control block - it's always first
  if (blockType === 'control') {
    switch (pageType) {
      case 'prep': return getProgressValue('prepControl');
      case 'vignette': return getProgressValue('vignetteControl');
      case 'survey': return getProgressValue('surveyControl');
    }
  }
  
  const session = getCurrentSession();
  if (!session) return 0;
  
  const completedBlocks = session.blocks?.length || 0;
  const isSecondBlock = completedBlocks === 1; // After control block
  const isThirdBlock = completedBlocks === 2; // After control and one condition block
  
  if (isSecondBlock) {
    // This is the second block
    switch (pageType) {
      case 'prep': return getProgressValue('prepSecond');
      case 'vignette': return getProgressValue('vignetteSecond');
      case 'survey': return getProgressValue('surveySecond');
    }
  } else if (isThirdBlock) {
    // This is the third block
    switch (pageType) {
      case 'prep': return getProgressValue('prepThird');
      case 'vignette': return getProgressValue('vignetteThird');
      case 'survey': return getProgressValue('surveyThird');
    }
  }
  
  return 0; // Fallback
}

/**
 * Get progress for survey pages based on their specific type
 */
export function getSurveyProgress(surveyType: 'control' | 'prestige' | 'dominance'): number {
  if (surveyType === 'control') {
    return getProgressValue('surveyControl');
  }
  
  return getConditionProgress(surveyType, 'survey');
} 