import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',

        blue: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/50',
        green:
          'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900/50',
        yellow:
          'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800 dark:hover:bg-yellow-900/50',
        red: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900/50',
        purple:
          'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-900/50',
        gray: 'bg-muted text-muted-foreground border-border hover:bg-muted/80',
      },

      selected: {
        true: '',
        false: 'bg-muted text-muted-foreground border-border hover:bg-muted/80',
      },
    },
    compoundVariants: [
      {
        selected: false,
        variant: ['blue', 'green', 'yellow', 'red', 'purple', 'gray'],
        className:
          'bg-muted text-muted-foreground border-border hover:bg-muted/80',
      },
    ],
    defaultVariants: {
      variant: 'default',
      selected: true,
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  selected?: boolean
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, selected, ...props }, ref) => {
    return (
      <div
        className={cn(badgeVariants({ variant, selected }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants }
