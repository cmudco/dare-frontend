// Framer Motion Animation Variants for Feedback Component

import { Variants } from 'framer-motion'

// FAB Button Animations
export const fabVariants: Variants = {
  idle: {
    y: [0, -4, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  hover: {
    scale: 1.1,
    boxShadow: '0 8px 30px rgba(238, 24, 60, 0.4)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    },
  },
}

// Pulse ring animation for FAB
export const pulseRingVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 0.6,
  },
  animate: {
    scale: [1, 1.5, 1.8],
    opacity: [0.6, 0.3, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatDelay: 28, // Pulse every 30 seconds
      ease: 'easeOut',
    },
  },
}

// Panel Animations
export const panelVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 10,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
}

// Backdrop overlay
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
}

// Step transition animations
export const stepVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -50 : 50,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  }),
}

// Emoji button animations
export const emojiVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.3,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    },
  },
  tap: {
    scale: 0.9,
  },
  selected: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.4,
      times: [0, 0.5, 1],
    },
  },
}

// Category card animations
export const categoryCardVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -2,
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20,
    },
  },
  tap: {
    scale: 0.98,
    y: 0,
  },
  selected: {
    scale: 1,
    boxShadow: '0 0 0 2px rgba(238, 24, 60, 0.8)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
}

// Stagger container for lists
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

// Stagger item
export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
}

// Success checkmark animation
export const checkmarkVariants: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        type: 'spring',
        duration: 0.5,
        bounce: 0.2,
      },
      opacity: { duration: 0.1 },
    },
  },
}

// Circle around checkmark
export const circleVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
      delay: 0.1,
    },
  },
}

// Thank you text animation
export const thankYouTextVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3,
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}

// Floating particles for confetti effect
export const particleVariants: Variants = {
  initial: {
    y: 0,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  animate: (i: number) => ({
    y: -100 - Math.random() * 100,
    x: (Math.random() - 0.5) * 200,
    opacity: 0,
    scale: 0,
    transition: {
      duration: 1 + Math.random() * 0.5,
      ease: 'easeOut',
      delay: i * 0.02,
    },
  }),
}

// Button loading spinner
export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// Shimmer effect for loading button
export const shimmerVariants: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// Progress dots
export const dotVariants: Variants = {
  inactive: {
    scale: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  active: {
    scale: 1.2,
    backgroundColor: '#EE183C',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  completed: {
    scale: 1,
    backgroundColor: '#10B981',
  },
}

// Icon rotation for FAB
export const iconRotateVariants: Variants = {
  closed: {
    rotate: 0,
  },
  open: {
    rotate: 45,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
}

// Tooltip animation
export const tooltipVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 5,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
}

// Screenshot flash effect
export const screenshotFlashVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: [0, 1, 0],
    transition: {
      duration: 0.3,
      times: [0, 0.1, 1],
    },
  },
}

// Background gradient shift
export const backgroundGradientVariants: Variants = {
  initial: {
    background:
      'linear-gradient(135deg, rgba(3, 10, 18, 0.95), rgba(3, 10, 18, 0.98))',
  },
  love: {
    background:
      'linear-gradient(135deg, rgba(238, 24, 60, 0.1), rgba(3, 10, 18, 0.98))',
    transition: { duration: 0.5 },
  },
  happy: {
    background:
      'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(3, 10, 18, 0.98))',
    transition: { duration: 0.5 },
  },
  neutral: {
    background:
      'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(3, 10, 18, 0.98))',
    transition: { duration: 0.5 },
  },
  confused: {
    background:
      'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(3, 10, 18, 0.98))',
    transition: { duration: 0.5 },
  },
  sad: {
    background:
      'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(3, 10, 18, 0.98))',
    transition: { duration: 0.5 },
  },
}
