import type { ReactNode } from 'react'

interface RunSectionProps {
  title: string
  children: ReactNode
}

// A titled card block used to group run-detail content.
const RunSection = ({ title, children }: RunSectionProps) => (
  <section className='rounded-xl border border-border bg-card p-5'>
    <h3 className='mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase'>
      {title}
    </h3>
    {children}
  </section>
)

export default RunSection
