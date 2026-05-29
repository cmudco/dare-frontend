import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Shared layout + typographic primitives for the landing page.
 * Centralised here so every section shares the same rhythm, gutters and
 * eyebrow treatment instead of each component re-inventing them.
 */

/** Page-width content column with consistent horizontal gutters. */
export const Container: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-10', className)}
    {...props}
  />
)

/** Small mono eyebrow label that sits above section headings. */
export const Eyebrow: React.FC<{
  children: React.ReactNode
  className?: string
  index?: string
}> = ({ children, className, index }) => (
  <div
    className={cn(
      'flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground',
      className
    )}
  >
    {index && <span className='text-dare'>{index}</span>}
    <span className='h-px w-8 bg-border' aria-hidden />
    <span>{children}</span>
  </div>
)

/** Section heading rendered in the editorial serif face. */
export const SectionTitle: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <h2
    className={cn(
      'font-serif text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl',
      className
    )}
  >
    {children}
  </h2>
)

/** Vertical rhythm wrapper for a top-level section. */
export const Section: React.FC<
  React.HTMLAttributes<HTMLElement> & { id?: string }
> = ({ className, ...props }) => (
  <section className={cn('py-24 sm:py-28', className)} {...props} />
)
