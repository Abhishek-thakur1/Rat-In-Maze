import { round } from 'lodash-es';

/**
 * Formats a duration in milliseconds into a human-friendly string.
 * - < 1000 ms → show in ms
 * - >= 1000 ms → show in seconds
 * @param ms Milliseconds
 * @param precision Decimal places (default: 2)
 */
export const formatTime = (ms: number, precision: number = 2): string => {
  if (ms < 1000) {
    return `${round(ms, precision)} ms`;
  }
  return `${round(ms / 1000, precision)} s`;
};
