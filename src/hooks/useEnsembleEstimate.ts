import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'
import type { PickerModel } from '@/redux/types/conversation'
import { estimateEnsemble, isEnsembleActive } from '@/utils/ensemble'

/**
 * The picker's ensemble resolved against the catalog, plus a live cost and
 * latency preview that follows what the person is typing.
 */
export const useEnsembleEstimate = () => {
  const ensemble = useSelector((s: RootState) => s.conversation.ensemble)
  const pickerEntries = useSelector(
    (s: RootState) => s.conversation.pickerEntries
  )
  const selectedModel = useSelector(
    (s: RootState) => s.conversation.selectedModel
  )
  const promptChars = useSelector(
    (s: RootState) => s.conversation.conversationInput.length
  )

  return useMemo(() => {
    const byId = new Map(pickerEntries.map((entry) => [entry.id, entry]))
    const responders = ensemble.responderIds
      .map((id) => byId.get(id))
      .filter((entry): entry is PickerModel => !!entry)
    const chairman =
      byId.get(ensemble.chairmanId ?? selectedModel ?? '') ?? null
    const active = isEnsembleActive(ensemble)
    const estimate = estimateEnsemble({
      promptChars,
      responders,
      chairman,
      depth: ensemble.depth,
    })
    return { ensemble, responders, chairman, active, estimate }
  }, [ensemble, pickerEntries, selectedModel, promptChars])
}
