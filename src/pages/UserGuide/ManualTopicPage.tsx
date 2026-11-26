import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import GuideArticle from '@/components/Documentation/GuideArticle'
import { cn } from '@/lib/utils'
import { manualTopics } from './topics'

interface ManualTopicPageProps {
  topicId: string
}

const ManualTopicPage = ({ topicId }: ManualTopicPageProps) => {
  const topicIndex = manualTopics.findIndex((entry) => entry.id === topicId)
  const topic = manualTopics[topicIndex]
  if (!topic)
    return (
      <section className='container mx-auto space-y-4 p-6'>
        <h1 className='text-3xl font-bold tracking-tight'>Topic not found</h1>
        <Link to='/help/user-guide' className='text-primary underline'>
          Browse the User Manual
        </Link>
      </section>
    )

  const previous = manualTopics[topicIndex - 1]
  const next = manualTopics[topicIndex + 1]
  const topicLinks = manualTopics.map((entry, index) => (
    <Link
      key={entry.id}
      to={`/help/user-guide/${entry.id}`}
      aria-current={entry.id === topic.id ? 'page' : undefined}
      className={cn(
        'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm leading-snug focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        entry.id === topic.id
          ? 'border-l-2 border-primary bg-primary/10 font-semibold text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      <span className='w-5 shrink-0 text-xs tabular-nums'>
        {String(index + 1).padStart(2, '0')}
      </span>
      <span>{entry.title}</span>
    </Link>
  ))

  return (
    <div className='mx-auto w-full min-w-0 p-4 sm:p-6 lg:p-8 xl:w-[94%]'>
      <nav
        aria-label='Mobile manual topics'
        className='mb-6 xl:hidden print:hidden'
      >
        <details
          key={topic.id}
          className='rounded-xl border border-border bg-card'
        >
          <summary className='flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'>
            <span>
              Topic {topicIndex + 1} of {manualTopics.length}: {topic.title}
            </span>
            <ChevronDown className='h-4 w-4 shrink-0' aria-hidden='true' />
          </summary>
          <div className='grid gap-1 border-t border-border p-2 sm:grid-cols-2'>
            {topicLinks}
          </div>
        </details>
      </nav>
      <div className='grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_15rem] print:block'>
        <div className='min-w-0 rounded-2xl border border-border bg-card print:border-0'>
          <GuideArticle
            markdown={topic.markdown}
            backTo='/help/user-guide'
            backLabel='All manual topics'
          />
          <nav
            aria-label='Adjacent manual topics'
            className='grid gap-3 border-t border-border p-5 sm:grid-cols-2 sm:p-6 xl:hidden print:hidden'
          >
            {previous && (
              <Link
                to={`/help/user-guide/${previous.id}`}
                rel='prev'
                className='flex min-h-16 items-center gap-3 rounded-xl border border-border bg-card p-4 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
              >
                <ArrowLeft className='h-4 w-4 shrink-0' aria-hidden='true' />
                <span>
                  <span className='block text-xs text-muted-foreground'>
                    Previous
                  </span>
                  <span className='text-sm font-medium'>{previous.title}</span>
                </span>
              </Link>
            )}
            {next && (
              <Link
                to={`/help/user-guide/${next.id}`}
                rel='next'
                className='flex min-h-16 items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:col-start-2'
              >
                <span>
                  <span className='block text-xs text-muted-foreground'>
                    Next
                  </span>
                  <span className='text-sm font-medium'>{next.title}</span>
                </span>
                <ArrowRight className='h-4 w-4 shrink-0' aria-hidden='true' />
              </Link>
            )}
          </nav>
        </div>
        <nav
          aria-label='Manual topics'
          className='sticky top-6 hidden self-start xl:block print:hidden'
        >
          <p className='mb-3 px-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase'>
            User Manual
          </p>
          <div className='space-y-1 border-l border-border pl-3'>
            {topicLinks}
          </div>
        </nav>
      </div>
    </div>
  )
}

export default ManualTopicPage
