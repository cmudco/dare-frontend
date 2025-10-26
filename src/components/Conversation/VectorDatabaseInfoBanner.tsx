import React from 'react'
import { Info } from 'lucide-react'

interface VectorDatabaseInfoBannerProps {
  maxContextSnippets: number
  documentSimilarityThreshold: number
}

const VectorDatabaseInfoBanner: React.FC<VectorDatabaseInfoBannerProps> = ({
  maxContextSnippets,
  documentSimilarityThreshold,
}) => {
  const isTopKMode = documentSimilarityThreshold === 0

  return (
    <div
      className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
        isTopKMode
          ? 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800/30 dark:bg-blue-900/20 dark:text-blue-100'
          : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/30 dark:bg-amber-900/20 dark:text-amber-100'
      }`}
    >
      <Info className='mt-0.5 h-4 w-4 flex-shrink-0' />
      <div className='space-y-1'>
        {isTopKMode ? (
          <>
            <p className='font-semibold'>🎯 Top-K Mode Active</p>
            <p className='text-xs opacity-90'>
              Threshold is set to 0. The system will retrieve exactly the top{' '}
              <span className='font-mono font-bold'>{maxContextSnippets}</span>{' '}
              most relevant snippets without any similarity filtering.
            </p>
          </>
        ) : (
          <>
            <p className='font-semibold'>🔍 Similarity Filtering Mode</p>
            <p className='text-xs opacity-90'>
              Threshold is{' '}
              <span className='font-mono font-bold'>
                {documentSimilarityThreshold.toFixed(2)}
              </span>
              . The system will retrieve up to{' '}
              <span className='font-mono font-bold'>{maxContextSnippets}</span>{' '}
              snippets that meet or exceed this similarity score. Set threshold
              to 0 for pure Top-K mode.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default VectorDatabaseInfoBanner
