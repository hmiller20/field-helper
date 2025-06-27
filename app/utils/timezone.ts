// Timezone utility functions for EST (Eastern Time)

/**
 * Get current time in EST as a timestamp (milliseconds)
 */
export const getESTTimestamp = (): number => {
  const now = new Date();
  // Convert to EST (UTC-5 for EST, UTC-4 for EDT)
  const estOffset = -5 * 60; // EST is UTC-5 (in minutes)
  const edtOffset = -4 * 60; // EDT is UTC-4 (in minutes)
  
  // Check if we're in daylight saving time
  const currentYear = now.getFullYear();
  const dstStart = new Date(currentYear, 2, 14); // Second Sunday in March (approximate)
  const dstEnd = new Date(currentYear, 10, 7); // First Sunday in November (approximate)
  
  // Adjust for actual DST dates
  dstStart.setDate(14 - dstStart.getDay()); // Second Sunday
  dstEnd.setDate(7 - dstEnd.getDay()); // First Sunday
  
  const isDST = now >= dstStart && now < dstEnd;
  const offset = isDST ? edtOffset : estOffset;
  
  // Create EST time
  const estTime = new Date(now.getTime() + (offset * 60 * 1000));
  return estTime.getTime();
};

/**
 * Convert a timestamp to EST and format as ISO string
 */
export const toESTISOString = (timestamp: number): string => {
  const date = new Date(timestamp);
  
  // Get EST offset
  const currentYear = date.getFullYear();
  const dstStart = new Date(currentYear, 2, 14);
  const dstEnd = new Date(currentYear, 10, 7);
  dstStart.setDate(14 - dstStart.getDay());
  dstEnd.setDate(7 - dstEnd.getDay());
  
  const isDST = date >= dstStart && date < dstEnd;
  const offsetHours = isDST ? -4 : -5;
  
  // Create EST time
  const estTime = new Date(date.getTime() + (offsetHours * 60 * 60 * 1000));
  
  // Format as ISO string with EST timezone indicator
  const isoString = estTime.toISOString().slice(0, -1); // Remove Z
  const tzSuffix = isDST ? '-04:00' : '-05:00';
  return isoString + tzSuffix;
};

/**
 * Convert timestamp to EST and format for display
 */
export const formatESTDateTime = (timestamp: number): string => {
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

/**
 * Convert timestamp to EST and format time only
 */
export const formatESTTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

/**
 * Get current date in EST as YYYY-MM-DD format
 */
export const getESTDate = (): string => {
  const now = new Date();
  const estDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  
  const year = estDate.getFullYear();
  const month = String(estDate.getMonth() + 1).padStart(2, '0');
  const day = String(estDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Convert a UTC ISO string to EST timestamp
 */
export const parseUTCToEST = (utcISOString: string): number => {
  const utcDate = new Date(utcISOString);
  return utcDate.getTime();
}; 