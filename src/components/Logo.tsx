import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Official DARE brand lockup: the Scottie shield mark + the "DARE" wordmark
 * (real text, not an image, so size/spacing are controllable), with an optional
 * "A Carnegie Mellon University Project" tagline beneath.
 *
 * Single source of truth for the brand across the app — dashboard header, auth,
 * landing nav/footer, etc. all render this so they stay identical.
 *
 * Note: font-size and line-height are set together (e.g. `text-2xl/[0.85]`) so
 * the crushed line-height isn't overridden by the text-size utility's default
 * line-height. This keeps the line-box tight against the glyphs — the wordmark
 * highlights cleanly and sits snug above the tagline.
 *
 * Presentational only: wrap in a link/button where a click target is needed.
 */

const SIZES = {
  // Only `word` (the DARE font size) changes meaningfully between variants —
  // tweak these to taste. Line-height stays crushed (`/[0.85]`) so the lockup
  // stays tight at any size.
  sm: {
    shield: 'w-7',
    word: 'text-base/[0.85]',
    tagline: 'text-[0.5rem]/[1]',
    gap: 'gap-2',
  },
  md: {
    shield: 'w-9',
    word: 'text-xl/[0.85]',
    tagline: 'text-[0.56rem]/[1]',
    gap: 'gap-2.5',
  },
  lg: {
    shield: 'w-12',
    word: 'text-3xl/[0.85]',
    tagline: 'text-[0.7rem]/[1]',
    gap: 'gap-3',
  },
} as const

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof SIZES
  /**
   * `horizontal` (default): shield to the left of the wordmark — for nav bars.
   * `vertical`: shield stacked above a centered wordmark — for auth/splash cards.
   */
  orientation?: 'horizontal' | 'vertical'
  /** Show the "A Carnegie Mellon University Project" tagline beneath the wordmark. */
  showTagline?: boolean
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  orientation = 'horizontal',
  showTagline = true,
  className,
  ...props
}) => {
  const s = SIZES[size]
  const isVertical = orientation === 'vertical'
  return (
    <div
      role='img'
      aria-label='DARE — A Carnegie Mellon University Project'
      className={cn(
        'flex',
        isVertical ? 'flex-col items-center text-center' : 'items-center',
        s.gap,
        className
      )}
      {...props}
    >
      <img
        src='/icons/Logo.png'
        alt=''
        aria-hidden
        className={cn('h-auto shrink-0', s.shield)}
      />
      <div className={cn('flex flex-col', isVertical && 'items-center')}>
        <span
          className={cn(
            'font-sans font-extrabold uppercase tracking-[0.1em] text-foreground',
            s.word
          )}
        >
          DARE
        </span>
        {showTagline && (
          <span
            className={cn(
              'mt-0.5 whitespace-nowrap font-sans font-medium text-muted-foreground',
              s.tagline
            )}
          >
            A Carnegie Mellon University Project
          </span>
        )}
      </div>
    </div>
  )
}

export default Logo
