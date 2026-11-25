import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'

import { motionAllowed, ticks } from '@/lib/motion'
import { cn } from '@/lib/utils'

// The thumb's tail lags behind as it travels, then it squashes against the end it reaches.
function playToggle(root: HTMLButtonElement) {
  if (!motionAllowed()) return
  const turningOn = root.dataset.state !== 'checked'
  requestAnimationFrame(() => {
    const thumb = root.querySelector('span')
    if (!thumb || (root.dataset.state === 'checked') !== turningOn) return
    const size = thumb.offsetWidth
    const lead = turningOn ? 1 : 0
    const frame = (width: number, offset?: number) => ({
      width: `${size * width}px`,
      marginLeft: `${size * (1 - width) * lead}px`,
      offset,
    })
    thumb.animate(
      [
        frame(1),
        frame(1.35, 0.25),
        frame(1, 0.4),
        frame(0.8, 0.58),
        frame(1.03, 0.8),
        frame(1),
      ],
      { duration: 400 }
    )
    if (!turningOn) return
    setTimeout(() => {
      const box = root.getBoundingClientRect()
      ticks(box.right + 1, box.top + box.height / 2, {
        direction: 0,
        spread: 1.4,
      })
    }, 110)
  })
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, onClick, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      className
    )}
    {...props}
    onClick={(event) => {
      onClick?.(event)
      playToggle(event.currentTarget)
    }}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
