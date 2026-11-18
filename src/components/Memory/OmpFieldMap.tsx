/**
 * OmpFieldMap
 *
 * One memory drawn twice: as DARE keeps it and as its Open Memory Protocol
 * record, with a wire for every field that travels.
 */
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { OmpFieldEntry, OmpRecord } from '@/redux/types/memory'
import { cn } from '@/lib/utils'

interface Wire {
  entry: number
  field: string
  d: string
  ends: [number, number][]
}

const REQUIRED = ['identifier', 'media_type', 'body', 'created_at']

const HOW_LABEL: Record<OmpFieldEntry['how'], string> = {
  kept: 'kept as is',
  reshaped: 'reshaped on the way',
  stays: 'stays in DARE',
  added: 'added on export',
}

const preview = (value: unknown): string => {
  if (typeof value === 'string') {
    return `"${value.length > 44 ? `${value.slice(0, 44)}…` : value}"`
  }
  if (Array.isArray(value)) {
    return `[ ${value.length} ${value.length === 1 ? 'item' : 'items'} ]`
  }
  if (value && typeof value === 'object') {
    return `{ ${Object.keys(value).join(', ')} }`
  }
  return String(value)
}

const Swatch = ({ dashed = false }: { dashed?: boolean }) => (
  <svg width='28' height='6' aria-hidden className='shrink-0'>
    <line
      x1='0'
      y1='3'
      x2='28'
      y2='3'
      strokeWidth='2'
      strokeDasharray={dashed ? '5 4' : undefined}
      className='stroke-primary'
    />
  </svg>
)

const OmpFieldMap = ({ record }: { record: OmpRecord }) => {
  const frame = useRef<HTMLDivElement>(null)
  const left = useRef<Record<number, HTMLElement | null>>({})
  const right = useRef<Record<string, HTMLElement | null>>({})
  const [wires, setWires] = useState<Wire[]>([])
  const [active, setActive] = useState<{
    entry?: number
    field?: string
  } | null>(null)

  const entries = useMemo(
    () => record.fields.filter((entry) => entry.how !== 'added'),
    [record]
  )
  const added = useMemo(
    () =>
      new Set(
        record.fields
          .filter((entry) => entry.how === 'added')
          .flatMap((entry) => entry.omp)
      ),
    [record]
  )
  // Fields sit in the order their sources do, so wires cross as little as
  // possible; fields added on export come last.
  const fields = useMemo(() => {
    const sourced = entries.flatMap((entry) => entry.omp)
    const names = Object.keys(record.memory)
    return [...new Set([...sourced, ...names])].filter((name) =>
      names.includes(name)
    )
  }, [entries, record])

  useLayoutEffect(() => {
    const box = frame.current
    if (!box) return
    const measure = () => {
      const origin = box.getBoundingClientRect()
      const next: Wire[] = []
      entries.forEach((entry, index) => {
        const from = left.current[index]?.getBoundingClientRect()
        if (!from) return
        entry.omp.forEach((field) => {
          const to = right.current[field]?.getBoundingClientRect()
          if (!to) return
          const x1 = from.right - origin.left
          const y1 = from.top + from.height / 2 - origin.top
          const x2 = to.left - origin.left
          const y2 = to.top + to.height / 2 - origin.top
          const bend = (x2 - x1) / 2
          next.push({
            entry: index,
            field,
            d: `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`,
            ends: [
              [x1, y1],
              [x2, y2],
            ],
          })
        })
      })
      setWires(next)
    }
    measure()
    // The dialog scales in, so measure again once it has settled.
    const settled = setTimeout(measure, 350)
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    return () => {
      clearTimeout(settled)
      observer.disconnect()
    }
  }, [entries, fields])

  const lit = (wire: Wire) =>
    !active ||
    (active.entry !== undefined
      ? active.entry === wire.entry
      : active.field === wire.field)
  const litEntry = (index: number) =>
    !active || wires.some((wire) => wire.entry === index && lit(wire))
  const litField = (field: string) =>
    !active || wires.some((wire) => wire.field === field && lit(wire))

  const focus =
    active?.entry !== undefined
      ? entries[active.entry]
      : active?.field
        ? (entries.find((entry) => entry.omp.includes(active.field!)) ?? null)
        : null
  const counts = entries.reduce<Record<string, number>>(
    (total, entry) => ({ ...total, [entry.how]: (total[entry.how] ?? 0) + 1 }),
    {}
  )

  return (
    <div>
      <div
        ref={frame}
        className='relative grid grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_9rem_minmax(0,1fr)]'
        onMouseLeave={() => setActive(null)}
      >
        <section className='overflow-hidden rounded-xl border border-border bg-card'>
          <header className='flex items-baseline justify-between border-b border-border bg-muted/50 px-4 py-2.5'>
            <h3 className='text-sm font-semibold'>In DARE</h3>
            <span className='font-mono text-[11px] text-muted-foreground'>
              how DARE keeps it
            </span>
          </header>
          <ul className='space-y-1 p-2'>
            {entries.map((entry, index) => (
              <li
                key={entry.label}
                ref={(node) => {
                  left.current[index] = node
                }}
                onMouseEnter={() => setActive({ entry: index })}
                className={cn(
                  'flex cursor-default items-baseline gap-2 rounded-md px-2 py-1.5 font-mono text-xs transition-opacity',
                  !litEntry(index) && 'opacity-30',
                  active?.entry === index && 'bg-muted',
                  entry.how === 'stays' && 'border border-dashed border-border'
                )}
              >
                <span className='shrink-0 text-muted-foreground'>
                  {entry.label}
                </span>
                <span className='truncate text-foreground'>{entry.value}</span>
                {entry.how === 'stays' && (
                  <span className='ml-auto shrink-0 text-[10px] tracking-wide text-muted-foreground uppercase'>
                    stays here
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <div aria-hidden />

        <section className='overflow-hidden rounded-xl border border-primary/40 bg-card'>
          <header className='flex items-baseline justify-between border-b border-border bg-muted/50 px-4 py-2.5'>
            <h3 className='text-sm font-semibold'>OMP record</h3>
            <span className='font-mono text-[11px] text-muted-foreground'>
              what another system receives
            </span>
          </header>
          <ul className='space-y-1 p-2'>
            {fields.map((field) => (
              <li
                key={field}
                ref={(node) => {
                  right.current[field] = node
                }}
                onMouseEnter={() => setActive({ field })}
                className={cn(
                  'flex cursor-default items-baseline gap-2 rounded-md px-2 py-1.5 font-mono text-xs transition-opacity',
                  !litField(field) && 'opacity-30',
                  active?.field === field && 'bg-muted'
                )}
              >
                <span
                  className={cn(
                    'shrink-0',
                    REQUIRED.includes(field)
                      ? 'font-semibold text-primary'
                      : 'text-foreground'
                  )}
                >
                  "{field}":
                </span>
                <span className='truncate text-muted-foreground'>
                  {preview(record.memory[field])}
                </span>
                {added.has(field) && (
                  <span className='ml-auto shrink-0 text-[10px] tracking-wide text-muted-foreground uppercase'>
                    added
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <svg
          className='pointer-events-none absolute inset-0 h-full w-full'
          aria-hidden
        >
          {wires.map((wire, index) => (
            <motion.path
              key={`${wire.entry}-${wire.field}-${wire.d}`}
              d={wire.d}
              fill='none'
              strokeLinecap='round'
              strokeDasharray={
                entries[wire.entry].how === 'reshaped' ? '5 4' : undefined
              }
              className='stroke-primary'
              initial={{ opacity: 0 }}
              animate={{
                opacity: lit(wire) ? (active ? 1 : 0.55) : 0.08,
                strokeWidth: lit(wire) && active ? 2.5 : 1.5,
              }}
              transition={{
                duration: 0.25,
                delay: active ? 0 : Math.min(index * 0.03, 0.6),
              }}
            />
          ))}
          {wires.flatMap((wire) =>
            wire.ends.map(([cx, cy], end) => (
              <circle
                key={`${wire.entry}-${wire.field}-${end}`}
                cx={cx}
                cy={cy}
                r={lit(wire) && active ? 3.5 : 2.5}
                opacity={lit(wire) ? 1 : 0.15}
                className='fill-primary'
              />
            ))
          )}
        </svg>
      </div>

      <div className='mt-3 min-h-11 rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm'>
        {focus ? (
          <p>
            <span className='font-mono text-xs'>
              {focus.label}
              {focus.omp.length > 0 && ` → ${focus.omp.join(', ')}`}
            </span>
            <span className='mx-2 text-muted-foreground'>·</span>
            <span className='font-medium'>{HOW_LABEL[focus.how]}</span>
            <span className='mx-2 text-muted-foreground'>·</span>
            <span className='text-muted-foreground'>{focus.note}</span>
          </p>
        ) : active?.field && added.has(active.field) ? (
          <p>
            <span className='font-mono text-xs'>{active.field}</span>
            <span className='mx-2 text-muted-foreground'>·</span>
            <span className='font-medium'>{HOW_LABEL.added}</span>
            <span className='mx-2 text-muted-foreground'>·</span>
            <span className='text-muted-foreground'>
              DARE adds it so any system can read the record.
            </span>
          </p>
        ) : (
          <p className='text-muted-foreground'>
            Point at a field to see what happens to it on the way out.
          </p>
        )}
      </div>

      <div className='mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground'>
        <span className='inline-flex items-center gap-2'>
          <Swatch /> kept as is · {counts.kept ?? 0}
        </span>
        <span className='inline-flex items-center gap-2'>
          <Swatch dashed /> reshaped on the way · {counts.reshaped ?? 0}
        </span>
        {counts.stays && (
          <span className='inline-flex items-center gap-2'>
            <span className='h-3 w-5 rounded-sm border border-dashed border-border' />
            stays in DARE · {counts.stays}
          </span>
        )}
        <span className='inline-flex items-center gap-2'>
          <span className='font-mono font-semibold text-primary'>"…"</span>
          required by the protocol
        </span>
      </div>
    </div>
  )
}

export default OmpFieldMap
