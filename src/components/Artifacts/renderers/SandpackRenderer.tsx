import React from 'react'
import {
  SandpackProvider,
  SandpackPreview,
  useSandpack,
} from '@codesandbox/sandpack-react'

interface SandpackRendererProps {
  code: string
  title: string
  onError?: (error: string) => void
}

/**
 * Loading indicator while Sandpack bundles
 */
const LoadingOverlay: React.FC = () => {
  const { sandpack } = useSandpack()
  const isLoading = sandpack.status === 'initial' || sandpack.status === 'idle'

  if (!isLoading) return null

  return (
    <div className='absolute inset-0 z-10 flex items-center justify-center bg-neutral-950'>
      <div className='flex flex-col items-center gap-3'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent' />
        <span className='text-sm text-neutral-400'>Loading component...</span>
      </div>
    </div>
  )
}

/**
 * SandpackRenderer - Renders React components using CodeSandbox's Sandpack
 *
 * Features:
 * - Full npm package support (any Lucide icon, etc.)
 * - Tailwind CSS via CDN
 * - Standard ES6 imports
 * - Battle-tested by CodeSandbox
 */
export const SandpackRenderer: React.FC<SandpackRendererProps> = ({
  code,
  title: _title, // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  return (
    <div className='relative h-full min-w-0' style={{ minHeight: '100%' }}>
      <style>{`
        .sp-wrapper { height: 100% !important; }
        .sp-layout { height: 100% !important; border: none !important; }
        .sp-stack { height: 100% !important; }
        .sp-preview-container { height: 100% !important; }
        .sp-preview { height: 100% !important; }
        .sp-preview-iframe { height: 100% !important; }
        .sp-preview-actions { display: none !important; }
      `}</style>
      <SandpackProvider
        template='react'
        theme='dark'
        files={{
          '/App.js': code,
        }}
        customSetup={{
          dependencies: {
            'lucide-react': '^0.300.0',
          },
        }}
        options={{
          externalResources: ['https://cdn.tailwindcss.com'],
          autorun: true,
          autoReload: true,
        }}
      >
        <LoadingOverlay />
        <div className='h-full min-w-0'>
          <SandpackPreview
            showNavigator={false}
            showOpenInCodeSandbox={false}
            showRefreshButton={false}
            style={{ height: '100%', width: '100%' }}
          />
        </div>
      </SandpackProvider>
    </div>
  )
}

export default SandpackRenderer
