import * as React from 'react'

import { motionAllowed } from '@/lib/motion'
import { cn } from '@/lib/utils'

// Adapted from LibreChat's composer effort slider (MIT, Copyright (c) 2026 LibreChat).
const TRACK_HEIGHT = 24
// The thumb overhangs the rail at rest and grows while held; the row is sized for the larger.
const THUMB = 28
const THUMB_HELD = 32
// How far the held thumb can lean toward the pointer, and how quickly the pull stiffens.
const MAX_LEAN = 10
const LEAN_STIFFNESS = 0.55
const LEAN_STRETCH = 0.16
const LEAN_SQUASH = 0.08

const ARROW_STEP: Record<string, number | undefined> = {
  ArrowLeft: -1,
  ArrowDown: -1,
  ArrowRight: 1,
  ArrowUp: 1,
}

/** Rubber-band resistance: follows the pointer closely at first, then stiffens toward MAX_LEAN. */
const leanFor = (distance: number) =>
  Math.sign(distance) *
  MAX_LEAN *
  (1 - 1 / ((Math.abs(distance) * LEAN_STIFFNESS) / MAX_LEAN + 1))

interface StepSliderProps {
  /** One name per stop, lowest first. */
  labels: string[]
  value: number
  /** Called as a drag crosses onto another stop. */
  onValueChange?: (index: number) => void
  /** Called when a stop is chosen: on release or with the keyboard. */
  onValueCommit: (index: number) => void
  'aria-label': string
  className?: string
}

/**
 * A slider for a few named levels. The stops are choices, not a continuum, so they are a
 * radiogroup of hit targets, with a pointer sweep layered on top that snaps between them.
 */
function StepSlider({
  labels,
  value,
  onValueChange,
  onValueCommit,
  className,
  'aria-label': ariaLabel,
}: StepSliderProps) {
  const stops = React.useRef<(HTMLButtonElement | null)[]>([])
  const sweptTo = React.useRef<number | null>(null)
  const [held, setHeld] = React.useState(false)

  const last = labels.length - 1
  const ratioOf = (index: number) => (last === 0 ? 1 : index / last)
  const centerOf = (index: number) =>
    `calc(${THUMB / 2}px + ${ratioOf(index)} * (100% - ${THUMB}px))`
  const edge = (ratio: number, fromRight = false) =>
    `calc(${(fromRight ? 1 - ratio : ratio) * 100}% + ${THUMB * (fromRight ? ratio - 0.5 : 0.5 - ratio)}px)`

  // The thumb snaps to the nearest stop and leans toward the pointer from there. The lean is
  // written to the track as custom properties, so it follows the pointer without a render.
  const sweep = (track: HTMLDivElement, pointerX: number) => {
    const box = track.getBoundingClientRect()
    const usable = box.width - THUMB
    const ratio = (pointerX - box.left - THUMB / 2) / usable
    const index = Math.round(Math.min(1, Math.max(0, ratio)) * last)
    if (motionAllowed()) {
      const stopX = box.left + THUMB / 2 + ratioOf(index) * usable
      const lean = leanFor(pointerX - stopX)
      const strength = Math.abs(lean) / MAX_LEAN
      track.style.setProperty('--step-lean', `${lean.toFixed(2)}px`)
      track.style.setProperty(
        '--step-stretch',
        (1 + LEAN_STRETCH * strength).toFixed(3)
      )
      track.style.setProperty(
        '--step-squash',
        (1 - LEAN_SQUASH * strength).toFixed(3)
      )
    }
    if (index === sweptTo.current) return
    sweptTo.current = index
    onValueChange?.(index)
  }

  const release = (track: HTMLDivElement) => {
    for (const property of ['--step-lean', '--step-stretch', '--step-squash'])
      track.style.removeProperty(property)
    setHeld(false)
    if (sweptTo.current !== null) onValueCommit(sweptTo.current)
    sweptTo.current = null
  }

  const size = held ? THUMB_HELD : THUMB

  return (
    <div
      role='radiogroup'
      aria-label={ariaLabel}
      dir='ltr'
      style={{ height: THUMB_HELD }}
      className={cn(
        'relative w-full touch-none select-none',
        held ? 'cursor-grabbing' : 'cursor-pointer',
        className
      )}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        setHeld(true)
        sweep(event.currentTarget, event.clientX)
      }}
      onPointerMove={(event) => {
        if (sweptTo.current !== null) sweep(event.currentTarget, event.clientX)
      }}
      onPointerUp={(event) => release(event.currentTarget)}
      onPointerCancel={(event) => release(event.currentTarget)}
    >
      <span
        aria-hidden
        style={{ height: TRACK_HEIGHT }}
        className='absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-full bg-input'
      />
      {/* Ends at the thumb's centre, so the thumb always covers the fill's end. */}
      <span
        aria-hidden
        style={{ height: TRACK_HEIGHT, width: centerOf(value) }}
        className='step-slider-glide absolute top-1/2 left-0 -translate-y-1/2'
      >
        <span
          data-held={held || undefined}
          className={cn(
            'step-slider-fill block h-full rounded-full bg-dare-gradient',
            value === 0 ? 'opacity-0' : 'opacity-100'
          )}
        />
      </span>
      {labels.map((label, index) => (
        <span
          key={label}
          aria-hidden
          style={{ left: centerOf(index) }}
          className={cn(
            'absolute top-1/2 size-1 -translate-1/2 rounded-full opacity-60 transition-colors',
            index < value ? 'bg-primary-foreground' : 'bg-muted-foreground'
          )}
        />
      ))}
      <span
        aria-hidden
        style={{ left: centerOf(value), height: size, width: size }}
        className='step-slider-glide absolute top-1/2 -translate-1/2'
      >
        <span
          data-held={held || undefined}
          className='step-slider-thumb block size-full rounded-full bg-primary-foreground shadow-md ring-1 ring-border'
        />
      </span>
      {labels.map((label, index) => (
        <button
          key={label}
          ref={(node) => {
            stops.current[index] = node
          }}
          type='button'
          role='radio'
          aria-checked={index === value}
          aria-label={label}
          // One tab stop for the group; the arrow keys move between levels.
          tabIndex={index === value ? 0 : -1}
          style={{
            left: index === 0 ? 0 : edge(ratioOf(index - 0.5)),
            right: index === last ? 0 : edge(ratioOf(index + 0.5), true),
          }}
          className='absolute inset-y-0 rounded-full outline-hidden focus-visible:ring-2 focus-visible:ring-ring'
          onKeyDown={(event) => {
            const step = ARROW_STEP[event.key]
            if (step === undefined) return
            event.preventDefault()
            const next = Math.min(Math.max(index + step, 0), last)
            onValueCommit(next)
            stops.current[next]?.focus()
          }}
        />
      ))}
    </div>
  )
}

export { StepSlider }
