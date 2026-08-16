/**
 * Account Data Initial State
 */
import { AccountDataState } from '../types/accountData'

export const initialAccountDataState: AccountDataState = {
  exportingScope: null,
  restoring: false,
  restoreResult: null,
  deleting: false,
}
