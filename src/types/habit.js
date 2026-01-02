/**
 * Habit model (JS version)
 * This file exists for structure & consistency.
 * No TypeScript types are used.
 */

export const HABIT_TYPES = {
  BOOLEAN: "boolean",
  NUMERIC: "numeric",
};

/**
 * Habit object shape (reference)
 *
 * {
 *   id: string,
 *   title: string,
 *   type: "boolean" | "numeric",
 *   target?: number,
 *   unit?: string,
 *   color: string,
 *   icon: string,
 *   startDate: string (ISO),
 *   completedDates: string[] (YYYY-MM-DD)
 * }
 */
