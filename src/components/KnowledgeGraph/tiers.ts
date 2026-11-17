import type { EntityBand } from '@/redux/types/knowledgeGraph'

/** Names grouped by how many passages they appear in; tier 1 leads every list. */
export const TIERS: {
  tier: number
  band: EntityBand['band']
  title: string
  passages: string
  atLeast: number
}[] = [
  {
    tier: 1,
    band: '6+',
    title: 'Main cast',
    passages: '6 or more passages',
    atLeast: 6,
  },
  {
    tier: 2,
    band: '3-5',
    title: 'Recurring names',
    passages: '3 to 5 passages',
    atLeast: 3,
  },
  {
    tier: 3,
    band: '2',
    title: 'Named twice',
    passages: '2 passages',
    atLeast: 2,
  },
  {
    tier: 4,
    band: '1',
    title: 'Named once',
    passages: '1 passage',
    atLeast: 1,
  },
]

export const tierOf = (passages: number) =>
  TIERS.find((tier) => passages >= tier.atLeast) ?? TIERS[TIERS.length - 1]

/** Where each tier starts in the ranked order, and how many names it holds. */
export const tierRanges = (bands: EntityBand[] = []) => {
  let start = 0
  return TIERS.map((tier) => {
    const count = bands.find((band) => band.band === tier.band)?.entities ?? 0
    const range = { ...tier, start, count }
    start += count
    return range
  })
}
