import { SourceSort } from '@/utils/constants/project'

export interface SortableSource {
  label: string
  /** ISO timestamp; rows without one (shared libraries) sort by name. */
  date?: string
}

const byName = (a: SortableSource, b: SortableSource) =>
  a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })

export const sortSources = <T extends SortableSource>(
  rows: T[],
  sort: SourceSort
): T[] => {
  const sorted = [...rows]
  switch (sort) {
    case SourceSort.NAME_ASC:
      return sorted.sort(byName)
    case SourceSort.NAME_DESC:
      return sorted.sort((a, b) => byName(b, a))
    case SourceSort.NEWEST:
    case SourceSort.OLDEST: {
      const direction = sort === SourceSort.NEWEST ? -1 : 1
      return sorted.sort((a, b) =>
        a.date && b.date && a.date !== b.date
          ? direction * a.date.localeCompare(b.date)
          : byName(a, b)
      )
    }
  }
}
