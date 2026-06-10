/**
 * Memory Initial State
 */
import { MemoryState } from '../types/memory'

export const initialMemoryState: MemoryState = {
  items: [],
  itemsLoading: false,
  searchResults: null,
  searchLoading: false,
  seeding: false,
  clearing: false,
  importing: false,
  error: null,
}
