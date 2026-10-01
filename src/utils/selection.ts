/** Add the id when absent, remove it when present. */
export const toggleId = <Id>(ids: Id[], id: Id): Id[] =>
  ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]
