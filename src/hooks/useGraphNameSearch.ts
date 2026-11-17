import { useEffect, useState } from 'react'

import { getGraphNamesAPI } from '@/api/knowledgeGraph'
import type { GraphEntity } from '@/redux/types/knowledgeGraph'

import { useDebounce } from './useDebounce'

const TYPING_PAUSE_MS = 200

/** Names in a graph that match what is being typed, looked up on the server. */
export const useGraphNameSearch = (
  graphId: number,
  text: string,
  limit: number
) => {
  const typed = text.trim()
  const query = useDebounce(typed, TYPING_PAUSE_MS)
  const [found, setFound] = useState<{ query: string; names: GraphEntity[] }>({
    query: '',
    names: [],
  })

  useEffect(() => {
    if (!query) return
    let stale = false
    getGraphNamesAPI(graphId, { q: query, limit })
      .then((page) => {
        if (!stale) setFound({ query, names: page.results })
      })
      .catch(() => {
        if (!stale) setFound({ query, names: [] })
      })
    return () => {
      stale = true
    }
  }, [graphId, query, limit])

  // Results for an earlier search are never shown under a newer one.
  const settled = found.query === typed
  return { names: typed && settled ? found.names : [], settled }
}
