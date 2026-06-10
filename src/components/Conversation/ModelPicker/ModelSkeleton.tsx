import React from 'react'

const ModelSkeleton: React.FC = () => (
  <div className='animate-pulse space-y-4 px-2'>
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className='space-y-3 rounded-xl border border-accent/10 bg-accent/5 p-4'
      >
        <div className='h-4 w-24 rounded-sm bg-accent/20' />
        <div className='space-y-2'>
          <div className='h-10 w-full rounded-lg bg-accent/10' />
          <div className='h-10 w-full rounded-lg bg-accent/10' />
        </div>
      </div>
    ))}
  </div>
)

export default ModelSkeleton
