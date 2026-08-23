/**
 * A curated, externally-vectorized dataset a user can add to their library and
 * search alongside their own documents. The corpus lives once globally; "adding"
 * it is a lightweight per-user link, not a copy.
 *
 * NOTE: backed by static data for now; will be wired to the backend
 * `SharedLibrary` / `UserLibraryAccess` contract.
 */
export interface SharedLibrary {
  id: number
  slug: string
  name: string
  /** Short human description of what the corpus contains. */
  description: string
  /** Who curated/owns the dataset (e.g. 'CMU'). */
  curator: string
  /** Embedding model the corpus was built with — must match the query embedder. */
  embeddingModel: string
  /** Vector dimensionality. */
  dims: number
  /** Number of indexed chunks/objects, or null when unknown. */
  objectCount: number | null
  /** False for datasets shown as "coming soon". */
  isAvailable: boolean
  /** Whether the current user has added it to their library. */
  isAdded: boolean
}
