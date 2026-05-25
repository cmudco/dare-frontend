import type { ReactNode } from 'react'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'

import { baseOptions } from '@/lib/layout.shared'
import { source } from '@/lib/source'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      {...baseOptions()}
      tree={source.getPageTree()}
      sidebar={{
        defaultOpenLevel: 1,
        prefetch: false,
        banner: (
          <div className='from-fd-card to-fd-muted/50 rounded-lg border bg-gradient-to-br p-3 text-sm'>
            <p className='font-medium'>DARE Documentation</p>
            <p className='text-fd-muted-foreground mt-1'>
              Product guides and technical references in one place.
            </p>
          </div>
        ),
      }}
    >
      {children}
    </DocsLayout>
  )
}
