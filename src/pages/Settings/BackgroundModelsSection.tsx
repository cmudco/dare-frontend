import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { getBackgroundModelsAPI } from '@/api/backgroundModels'
import PlatformBackgroundModelsCard from '@/components/Settings/BackgroundModels/PlatformBackgroundModelsCard'
import TaskModelsCard from '@/components/Settings/BackgroundModels/TaskModelsCard'
import YourBackgroundModelCard from '@/components/Settings/BackgroundModels/YourBackgroundModelCard'
import { Skeleton } from '@/components/ui/skeleton'
import { getWallets } from '@/redux/asyncThunks/billing'
import { AppDispatch, RootState } from '@/redux/store'
import { BackgroundModelOverview } from '@/redux/types/backgroundModels'

const BackgroundModelsSection = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [overview, setOverview] = useState<BackgroundModelOverview | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Which models apply depends on the active wallet. The wallet list is
  // re-fetched after every switch or key edit, so reload whenever it changes;
  // the counter drops a slower, older response.
  const wallets = useSelector((state: RootState) => state.billing.wallets)
  const latestRequest = useRef(0)

  const load = useCallback(() => {
    const request = ++latestRequest.current
    getBackgroundModelsAPI()
      .then((data) => {
        if (request !== latestRequest.current) return
        setOverview(data)
        setError(null)
      })
      .catch((caught: Error) => setError(caught.message))
  }, [])

  useEffect(() => {
    dispatch(getWallets())
  }, [dispatch])

  useEffect(load, [load, wallets])

  if (error) {
    return <p className='text-sm text-destructive'>{error}</p>
  }
  if (!overview) {
    return <Skeleton className='h-64 w-full' />
  }

  return (
    <div className='space-y-6'>
      <TaskModelsCard tasks={overview.tasks} />
      <YourBackgroundModelCard
        overview={overview}
        onChanged={(next) => {
          latestRequest.current++
          setOverview(next)
        }}
      />
      {overview.canManagePlatform && (
        <PlatformBackgroundModelsCard onChanged={load} />
      )}
    </div>
  )
}

export default BackgroundModelsSection
