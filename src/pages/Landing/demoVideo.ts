/**
 * The published DARE demo (Dietrich College, updated 2026-10-21).
 *
 * It appears in two places: as the opening stop of the product tour, and as a
 * link under the hero CTAs that scrolls there.
 */
export const DEMO_VIDEO = {
  youtubeId: 'OdSq5x7RH0Q',
  title: 'DARE Demo Video',
  credit: "Carnegie Mellon University's Dietrich College",
  /** 1122s, read from the published video. */
  runtime: '18:42',
  runtimeLabel: '19-minute',
} as const

/**
 * Poster still.
 *
 * YouTube's auto-thumbnail for this upload is a frame of the Google Slides
 * window the demo was recorded in — browser chrome, tab bar and all — so we
 * use a console screenshot instead. Swap this for a purpose-shot still when
 * the team has one.
 */
export const demoVideoPoster = '/screenshots/dashboard.png'

export const demoVideoEmbedUrl = `https://www.youtube-nocookie.com/embed/${DEMO_VIDEO.youtubeId}?autoplay=1&rel=0&modestbranding=1`
