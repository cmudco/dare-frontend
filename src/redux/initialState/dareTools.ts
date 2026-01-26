/**
 * Initial state for DARE Tools Redux slice
 */

import { DareToolsState } from '../types/dareTools'

export const initialDareToolsState: DareToolsState = {
  tools: [],
  loading: false,
  error: null,
}
