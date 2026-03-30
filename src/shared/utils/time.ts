/**
 * Format milliseconds to "mm:ss" string
 * @param ms - Time in milliseconds
 * @returns Formatted time string in "mm:ss" format
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const minutesStr = minutes.toString().padStart(2, '0');
  const secondsStr = seconds.toString().padStart(2, '0');

  return `${minutesStr}:${secondsStr}`;
}

/**
 * Format milliseconds to human-readable duration string
 * @param ms - Time in milliseconds
 * @returns Formatted duration string (e.g., "2m 30s" or "45s")
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Convert phase duration to milliseconds
 * @param duration - Duration value
 * @param unit - Time unit ('seconds' or 'minutes')
 * @returns Duration in milliseconds
 */
export function phaseToMs(duration: number, unit: 'seconds' | 'minutes'): number {
  return unit === 'minutes' ? duration * 60 * 1000 : duration * 1000;
}
