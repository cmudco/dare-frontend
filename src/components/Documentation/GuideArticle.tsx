import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Markdown } from '@/components/Markdown/Markdown'
import { Button } from '@/components/ui/button'

const headingId = (heading: string) =>
  heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

interface GuideArticleProps {
  markdown: string
  backTo: string
  backLabel: string
}

const GuideArticle = ({ markdown, backTo, backLabel }: GuideArticleProps) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
    } else {
      contentRef.current?.closest('main')?.scrollTo(0, 0)
    }
  }, [hash, markdown])

  const content = (
    <div
      ref={contentRef}
      className='px-4 py-5 text-foreground sm:px-6 sm:py-6 lg:px-8 lg:py-8'
    >
      <nav
        aria-label='Guide navigation'
        className='mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden'
      >
        <Link
          to={backTo}
          className='rounded-sm font-semibold text-primary underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
        >
          {backLabel}
        </Link>
        <Button variant='outline' onClick={() => window.print()}>
          Print or save as PDF
        </Button>
      </nav>
      <div>
        <article className='prose max-w-[90ch] min-w-0 [overflow-wrap:anywhere] break-words text-foreground prose-headings:tracking-tight prose-headings:text-foreground prose-h1:mb-8 prose-h1:border-b prose-h1:border-border prose-h1:pb-6 prose-h1:text-2xl prose-h1:leading-tight prose-h1:font-semibold sm:prose-h1:text-4xl prose-h2:text-2xl prose-h2:leading-snug prose-h3:mt-8 prose-h3:border-l-2 prose-h3:border-dare prose-h3:pl-4 prose-h3:text-xl prose-p:max-w-[90ch] prose-p:leading-relaxed prose-p:text-foreground prose-a:text-primary prose-blockquote:rounded-r-xl prose-blockquote:border-dare prose-blockquote:bg-dare/5 prose-blockquote:px-5 prose-blockquote:py-1 prose-blockquote:font-normal prose-blockquote:text-foreground prose-blockquote:not-italic prose-strong:text-foreground prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-border prose-pre:bg-muted prose-pre:text-foreground prose-ol:max-w-[90ch] prose-ul:max-w-[90ch] prose-li:marker:text-muted-foreground prose-table:my-4 prose-th:bg-muted prose-th:p-3 prose-th:text-foreground prose-td:px-3 prose-td:py-3 prose-td:text-foreground'>
          <Markdown
            content={markdown}
            components={{
              a: ({ href, children }) =>
                href?.startsWith('/') && !href.startsWith('//') ? (
                  <Link to={href}>{children}</Link>
                ) : (
                  <a href={href}>{children}</a>
                ),
              h3: ({ children }) => (
                <h3 id={headingId(String(children))} className='scroll-mt-6'>
                  {children}
                </h3>
              ),
              table: ({ children }) => (
                <div className='my-5 overflow-x-auto rounded-xl border border-border [&_table]:my-0'>
                  <table>{children}</table>
                </div>
              ),
            }}
          />
        </article>
      </div>
    </div>
  )

  return content
}

export default GuideArticle
