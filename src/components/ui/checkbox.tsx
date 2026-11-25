import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'

import { glint, motionAllowed, ticks } from '@/lib/motion'
import { cn } from '@/lib/utils'

// The box dips and springs back; a new tick draws itself, throws three ticks and leaves a glint.
function playCheck(root: HTMLButtonElement) {
  if (!motionAllowed()) return
  const checking = root.dataset.state !== 'checked'
  requestAnimationFrame(() => {
    if ((root.dataset.state === 'checked') !== checking) return
    root.animate(
      [
        { scale: 0.72, rotate: '-4deg' },
        { scale: 1.08, rotate: '1deg', offset: 0.45 },
        { scale: 0.98, rotate: '0deg', offset: 0.75 },
        { scale: 1, rotate: '0deg' },
      ],
      { duration: 380, easing: 'ease-out' }
    )
    const mark = root.querySelector('path')
    if (!checking || !mark) return
    const length = mark.getTotalLength()
    mark.animate(
      [
        { strokeDasharray: length, strokeDashoffset: -length },
        { strokeDasharray: length, strokeDashoffset: 0 },
      ],
      {
        duration: 220,
        delay: 50,
        fill: 'backwards',
        easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)',
      }
    )
    const box = root.getBoundingClientRect()
    ticks(box.right, box.top)
    setTimeout(() => glint(box.right + 7, box.top - 5), 300)
  })
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, onClick, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-xs border border-primary ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      className
    )}
    {...props}
    onClick={(event) => {
      onClick?.(event)
      playCheck(event.currentTarget)
    }}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center text-current')}
    >
      <Check className='h-4 w-4' />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
