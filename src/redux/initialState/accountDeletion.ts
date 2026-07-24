import { AccountDeletionState } from '../types/accountDeletion'

export const initialAccountDeletionState: AccountDeletionState = {
  deleting: false,
  deleted: false,
  error: null,
}
