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
  input: 'bg-input border-border text-foreground',

  // Button classes
  buttonPrimary: 'bg-primary text-primary-foreground border-border',
  buttonSecondary: 'bg-secondary text-secondary-foreground border-border',

  // Accent and interactive elements
  accent: 'bg-accent text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
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
