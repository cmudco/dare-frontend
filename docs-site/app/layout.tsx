import './global.css'

import type { ReactNode } from 'react'
import { RootProvider } from 'fumadocs-ui/provider/next'

import { SearchDialog } from '@/components/search'

export const metadata = {
  title: {
    default: 'DARE Documentation',
    template: '%s | DARE Documentation',
  },
  description:
    'Client and technical documentation for the Dietrich Analysis Research Education (DARE) Platform.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className='flex min-h-screen flex-col'>
        <RootProvider
          search={{
            SearchDialog,
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
