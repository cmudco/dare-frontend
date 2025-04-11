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

        blue: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200',
        green:
          'bg-green-100 text-green-800 border-green-300 hover:bg-green-200',
        yellow:
          'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200',
        red: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200',
        purple:
          'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200',
        gray: 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200',
      },

      selected: {
        true: '',
        false: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200',
      },
    },
    compoundVariants: [
      {
        selected: false,
        variant: ['blue', 'green', 'yellow', 'red', 'purple', 'gray'],
        className:
          'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200',
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

function Badge({ className, variant, selected, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, selected }), className)}
      {...props}
    />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants }
