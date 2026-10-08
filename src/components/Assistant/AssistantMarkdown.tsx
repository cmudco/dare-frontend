import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from 'react-router-dom'

// Relative links are in-app pages the assistant points to; they navigate
// without a reload so the panel and thread stay open.
export function AssistantMarkdown({ content }: { content: string }) {
  return (
    <div className='prose prose-sm max-w-none wrap-break-word dark:prose-invert prose-p:my-1.5 prose-ol:my-1.5 prose-ul:my-1.5 prose-li:my-0.5'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children }) {
            if (href?.startsWith('/')) {
              return (
                <Link to={href} className='text-primary'>
                  {children}
                </Link>
              )
            }
            return (
              <a
                href={href}
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary'
              >
                {children}
              </a>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
