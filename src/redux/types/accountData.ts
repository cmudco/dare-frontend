/**
 * Account data portability
 *
 * One archive carries the whole account. The same archive is what a person
 * restores into a new account after deleting the old one, so the restore
 * result reports per-section counts rather than a single success flag.
 */

export enum ExportScope {
  FULL = 'full',
  MEMORIES = 'memories',
}

export interface RestoreResult {
  prompts: number
  conversations: number
  messages: number
  workflows: number
  memories: number
  /** Sections the archive held but the restore deliberately did not apply. */
  skipped: string[]
}

export interface DeleteAccountResult {
  detail: string
  warnings: string[]
}

export interface AccountDataState {
  exportingScope: ExportScope | null
  restoring: boolean
  restoreResult: RestoreResult | null
  deleting: boolean
}
