import { pluralize, MINUTES_FORMS, SECONDS_FORMS } from './pluralize';

export type DurationStyle = 'short' | 'full';

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
 * Convert phase duration to milliseconds
 * @param duration - Duration value
 * @param unit - Time unit ('seconds' or 'minutes')
 * @returns Duration in milliseconds
 */
export function phaseToMs(duration: number, unit: 'seconds' | 'minutes'): number {
  return unit === 'minutes' ? duration * 60 * 1000 : duration * 1000;
}

/**
 * Format milliseconds to human-readable duration string
 * @param ms - Time in milliseconds
 * @param style - 'short' = "2m 30s", 'full' = "2 минуты 30 секунд"
 * @returns Formatted duration string
 */
export function formatDuration(ms: number, style: DurationStyle = 'short'): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (style === 'full') {
    if (minutes > 0 && seconds > 0) {
      return `${minutes} ${pluralize(minutes, MINUTES_FORMS)} ${seconds} ${pluralize(seconds, SECONDS_FORMS)}`;
    }
    if (minutes > 0) {
      return `${minutes} ${pluralize(minutes, MINUTES_FORMS)}`;
    }
    return `${totalSeconds} ${pluralize(totalSeconds, SECONDS_FORMS)}`;
  }

  // short style
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
