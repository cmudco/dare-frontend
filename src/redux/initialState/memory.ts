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
  clearing: false,
  savingId: null,
  error: null,
}
