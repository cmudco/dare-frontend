/**
 * Memory Initial State
 */
import { MemoryState } from '../types/memory'

export const initialMemoryState: MemoryState = {
  items: [],
  itemsLoading: false,
  retired: [],
  retiredLoading: false,
  sweep: null,
  sweepLoading: false,
  applyingProposal: null,
  searchResults: null,
  searchLoading: false,
  sessionMode: false,
  sessionResults: null,
  sessionLoading: false,
  exporting: false,
  importing: false,
  backfillRun: null,
  backfillLoading: false,
  backfillStarting: false,
  backfillStopping: false,
  backfillError: null,
  clearing: false,
  savingId: null,
  error: null,
}
