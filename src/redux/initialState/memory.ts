/**
 * Memory Initial State
 */
import { MemoryState } from '../types/memory'

export const initialMemoryState: MemoryState = {
  items: [],
  itemsLoading: false,
  retired: [],
  retiredLoading: false,
  searchResults: null,
  searchLoading: false,
  clearing: false,
  savingId: null,
  error: null,
}
