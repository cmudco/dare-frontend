import { BookOpen, ExternalLink, LogIn } from 'lucide-react'
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className='flex items-center gap-2 font-semibold'>
          <span className='flex size-6 items-center justify-center rounded-md bg-[linear-gradient(92.18deg,#023572_-38.97%,#ee183c_132.6%)] text-xs font-bold text-white'>
            D
          </span>
          <span>DARE Docs</span>
        </span>
      ),
    },
    links: [
      {
        text: 'Guides',
        url: '/docs',
        icon: <BookOpen className='size-4' />,
        active: 'nested-url',
      },
      {
        text: 'Open App',
        url: '/dashboard',
        icon: <LogIn className='size-4' />,
      },
      {
        text: 'GitHub',
        url: 'https://github.com/cmudco',
        icon: <ExternalLink className='size-4' />,
        external: true,
      },
    ],
  }
}
