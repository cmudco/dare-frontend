import { useState } from 'react'
import { SOURCE_SORT_STORAGE_KEY, SourceSort } from '@/utils/constants/project'
import { getFromLocalStorage, saveToLocalStorage } from '@/utils/localStorage'

const isSourceSort = (value: string): value is SourceSort =>
  (Object.values(SourceSort) as string[]).includes(value)

/** The viewer's preferred source order, remembered in this browser. */
export const useSourceSort = () => {
  const [sort, setSort] = useState<SourceSort>(() => {
    const stored = getFromLocalStorage<string>(
      SOURCE_SORT_STORAGE_KEY,
      SourceSort.NEWEST
    )
    return isSourceSort(stored) ? stored : SourceSort.NEWEST
  })

  const changeSort = (next: SourceSort) => {
    setSort(next)
    saveToLocalStorage(SOURCE_SORT_STORAGE_KEY, next)
  }

  return [sort, changeSort] as const
}
