/**
 * Platform callback constants that match the backend CallbackChoice enum
 */
export const CALLBACK_VALUES = {
  DARE: 'dare',
  SOCRATIC_BOOKS: 'socraticbooks',
} as const

export type CallbackValue =
  (typeof CALLBACK_VALUES)[keyof typeof CALLBACK_VALUES]
