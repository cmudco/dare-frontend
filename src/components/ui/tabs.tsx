import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { motionAllowed, speedLines } from '@/lib/motion'
import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root

const PILL_LEAD = '280ms var(--ease-spring-soft)'
const PILL_TRAIL = '420ms var(--ease-spring-soft)'

// Keeps the pill under the active tab. Its leading edge moves faster than its trailing edge,
// so it stretches toward a newly picked tab before settling.
function trackActiveTab(list: HTMLDivElement, pill: HTMLSpanElement) {
  let lastLeft: number | null = null

  const place = (animate: boolean) => {
    const active = list.querySelector<HTMLElement>(
      '[role=tab][data-state=active]'
    )
    pill.hidden = !active
    if (!active) return
    // Offsets, not client rects: a list inside a dialog is measured mid zoom-in.
    const left = active.offsetLeft
    const moved = animate && lastLeft !== null && left !== lastLeft
    const forward = lastLeft !== null && left > lastLeft
    pill.style.transition =
      moved && motionAllowed()
        ? `left ${forward ? PILL_TRAIL : PILL_LEAD}, right ${forward ? PILL_LEAD : PILL_TRAIL}`
        : 'none'
    pill.style.left = `${left}px`
    pill.style.right = `${list.clientWidth - left - active.offsetWidth}px`
    pill.style.top = `${active.offsetTop}px`
    pill.style.height = `${active.offsetHeight}px`
    lastLeft = left
    if (!moved) return
    setTimeout(() => {
      const landed = active.getBoundingClientRect()
      speedLines(
        forward ? landed.left : landed.right,
        landed.top + landed.height / 2,
        {
          count: 3,
          direction: forward ? Math.PI : 0,
          length: 22,
          spread: 7,
        }
      )
    }, 170)
  }

  place(false)
  const onSelect = new MutationObserver(() => place(true))
  onSelect.observe(list, {
    attributes: true,
    attributeFilter: ['data-state'],
    subtree: true,
  })
  const onResize = new ResizeObserver(() => place(false))
  onResize.observe(list)
  return () => {
    onSelect.disconnect()
    onResize.disconnect()
  }
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const listRef = React.useRef<HTMLDivElement | null>(null)
  const pillRef = React.useRef<HTMLSpanElement>(null)

  React.useLayoutEffect(() => {
    if (!listRef.current || !pillRef.current) return
    return trackActiveTab(listRef.current, pillRef.current)
  }, [])

  return (
    <TabsPrimitive.List
      ref={(node) => {
        listRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      className={cn(
        'relative inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className
      )}
      {...props}
    >
      <span
        ref={pillRef}
        aria-hidden
        className='pointer-events-none absolute rounded-md bg-background shadow-xs'
      />
      {children}
    </TabsPrimitive.List>
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'relative inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground',
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
