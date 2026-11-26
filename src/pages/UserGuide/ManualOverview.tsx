import { ArrowRight, ArrowUpRight, ChevronDown, LifeBuoy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MANUAL_GROUPS, manualTopics } from './topics'

const ManualOverview = () => {
  return (
    <section className='mx-auto w-full min-w-0 space-y-8 p-4 sm:p-6 lg:p-8 xl:w-[94%]'>
      <div className='relative overflow-hidden rounded-2xl border border-border bg-card'>
        <div className='h-1.5 bg-dare-gradient' />
        <div className='grid gap-6 p-5 sm:gap-8 sm:p-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,1fr)] lg:p-10'>
          <div>
            <p className='mb-3 text-xs font-semibold tracking-widest text-primary uppercase'>
              DARE / Workspace handbook
            </p>
            <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
              User Manual
            </h1>
            <p className='mt-4 max-w-xl text-base leading-relaxed text-muted-foreground'>
              Start a conversation. Bring in your documents. Turn a useful
              prompt into a repeatable workflow.
            </p>
            <Link
              to='/help/user-guide/your-first-conversation'
              className='mt-6 inline-flex min-h-11 items-center gap-3 rounded-lg bg-dare-gradient px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none'
            >
              Your first conversation{' '}
              <ArrowRight className='h-4 w-4' aria-hidden='true' />
            </Link>
            <p className='mt-3 text-xs text-muted-foreground'>
              A short exercise with an answer you can check.
            </p>
          </div>
          <aside
            className='self-center rounded-xl border border-border bg-muted/40 p-5 sm:p-6'
            aria-label='A question to try'
          >
            <p className='text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
              Try it in a new conversation
            </p>
            <blockquote className='my-4 border-l-2 border-dare pl-4 text-sm leading-relaxed text-foreground select-text'>
              A workshop has 12 participants. Each participant needs 2 sheets of
              paper. How many sheets are needed? Show the calculation in one
              line.
            </blockquote>
            <details className='group border-t border-border pt-3'>
              <summary className='flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-sm text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'>
                Check the expected answer
                <ChevronDown
                  className='h-4 w-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none'
                  aria-hidden='true'
                />
              </summary>
              <p className='pt-2 text-sm leading-relaxed text-muted-foreground'>
                <strong className='font-semibold text-foreground'>
                  12 × 2 = 24 sheets.
                </strong>{' '}
                Compare the model’s answer with this calculation.
              </p>
            </details>
          </aside>
        </div>
      </div>
      <div className='grid gap-6 lg:grid-cols-3'>
        {MANUAL_GROUPS.map((group) => (
          <section key={group.label} className='min-w-0'>
            <div className='mb-3 border-b border-border pb-4'>
              <p className='text-xs font-medium tracking-wide text-muted-foreground'>
                {group.label}
              </p>
              <h2 className='mt-2 text-lg font-semibold tracking-tight'>
                {group.title}
              </h2>
            </div>
            <div className='divide-y divide-border rounded-xl border border-border bg-card px-4'>
              {manualTopics
                .filter((topic) => topic.group === group.id)
                .map(({ id, title, summary, icon: Icon }) => (
                  <Link
                    key={id}
                    to={`/help/user-guide/${id}`}
                    className='group flex min-h-32 items-start gap-3 rounded-lg py-5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
                  >
                    <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-dare/10 text-dare'>
                      <Icon className='h-4 w-4' aria-hidden='true' />
                    </span>
                    <span className='min-w-0 flex-1'>
                      <span className='block text-sm font-semibold group-hover:text-primary'>
                        {title}
                      </span>
                      <span className='mt-1.5 block text-sm leading-relaxed text-muted-foreground 2xl:text-base'>
                        {summary}
                      </span>
                    </span>
                    <ArrowUpRight
                      className='mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none'
                      aria-hidden='true'
                    />
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>
      <div className='flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-5 text-sm text-muted-foreground'>
        <LifeBuoy className='h-4 w-4' aria-hidden='true' />
        <span>Need model information or more help?</span>
        <Link
          to='/help'
          className='inline-flex min-h-11 items-center rounded-sm font-medium text-primary underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
        >
          Help
        </Link>
      </div>
    </section>
  )
}

export default ManualOverview
