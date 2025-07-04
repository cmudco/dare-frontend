/**
 * Utility functions for consistent dark mode styling
 * This centralizes all dark mode color handling using CSS variables
 */

/**
 * Semantic class builders for consistent dark mode styling
 * Uses CSS variables for maintainable theming
 */
export const darkClasses = {
  // Background classes using CSS variables
  primaryBg: 'bg-background',
  cardBg: 'bg-card',
  popoverBg: 'bg-popover',
  mutedBg: 'bg-muted',

  // Text classes using CSS variables
  primaryText: 'text-foreground',
  cardText: 'text-card-foreground',
  mutedText: 'text-muted-foreground',
  popoverText: 'text-popover-foreground',

  // Semantic text classes for different UI contexts
  headerText: 'text-foreground',
  bodyText: 'text-foreground',
  subtleText: 'text-muted-foreground',
  captionText: 'text-muted-foreground',
  labelText: 'text-foreground',
  placeholderText: 'text-muted-foreground',
  linkText: 'text-primary',
  errorText: 'text-destructive',
  successText: 'text-green-600 dark:text-green-400',
  warningText: 'text-yellow-600 dark:text-yellow-400',
  infoText: 'text-blue-600 dark:text-blue-400',

  // Border classes using CSS variables
  border: 'border-border',

  // Modal/Dialog classes
  modal: 'bg-background border-border text-foreground',
  popover: 'bg-popover border-border text-popover-foreground',

  // Table classes
  tableHeader: 'bg-background border-border text-foreground',
  tableFooter: 'bg-background border-border text-foreground',

  // Card classes
  card: 'bg-card border-border text-card-foreground',

  // Input classes
  input:
    'bg-input border-border text-foreground placeholder:text-muted-foreground',

  // Button classes
  buttonPrimary: 'bg-primary text-primary-foreground border-border',
  buttonSecondary: 'bg-secondary text-secondary-foreground border-border',

  // Accent and interactive elements
  accent: 'bg-accent text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
}

/**
 * Text color replacements for hardcoded gray colors
 * Use these instead of text-gray-* classes for dark mode compatibility
 */
export const textColors = {
  // Replace text-gray-900, text-black with these
  primary: 'text-foreground',

  // Replace text-gray-800, text-gray-700 with these
  secondary: 'text-foreground',

  // Replace text-gray-600, text-gray-500 with these
  muted: 'text-muted-foreground',

  // Replace text-gray-400, text-gray-300 with these
  subtle: 'text-muted-foreground',

  // Special purpose colors
  link: 'text-primary hover:text-primary/80',
  error: 'text-destructive',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400',
}

/**
 * Interactive element colors (buttons, icons, etc.)
 */
export const interactiveColors = {
  icon: 'text-muted-foreground hover:text-foreground',
  iconActive: 'text-foreground',
  button: 'text-muted-foreground hover:text-foreground',
  buttonActive: 'text-foreground',
}

/**
 * Helper function to combine classes with semantic CSS variables
 */
export const withSemanticColors = (
  baseClasses: string,
  colorScheme: keyof typeof darkClasses
) => {
  return `${baseClasses} ${darkClasses[colorScheme]}`
}

/**
 * Common component class combinations using CSS variables
 */
export const componentClasses = {
  modal: darkClasses.modal,
  table:
    darkClasses.primaryBg +
    ' ' +
    darkClasses.primaryText +
    ' ' +
    darkClasses.border,
  tableHeader: darkClasses.tableHeader,
  card: darkClasses.card,
  input: darkClasses.input,
  popover: darkClasses.popover,
  button: {
    primary: darkClasses.buttonPrimary,
    secondary: darkClasses.buttonSecondary,
    destructive: darkClasses.destructive,
  },
}

/**
 * Utility to replace hardcoded gray text colors with semantic equivalents
 */
export const replaceGrayText = (className: string): string => {
  return className
    .replace(/text-gray-900|text-black(?!\w)/g, textColors.primary)
    .replace(/text-gray-800|text-gray-700/g, textColors.secondary)
    .replace(/text-gray-600|text-gray-500/g, textColors.muted)
    .replace(/text-gray-400|text-gray-300/g, textColors.subtle)
}
