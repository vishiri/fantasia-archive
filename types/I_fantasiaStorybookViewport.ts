/**
 * Canonical Storybook iframe widths (px). Toolbar labels use the same caps as product breakpoints.
 */
export const FANTASIA_STORYBOOK_VIEWPORT_WIDTHS = {
  phone: 375,
  mobile: 768,
  tablet: 1024,
  desktop: 1920,
  desktop2k: 2560,
  desktop4k: 3840
} as const

/** Keys for fixed-width Storybook viewport toolbar presets. */
export type T_fantasiaStorybookViewportKey = keyof typeof FANTASIA_STORYBOOK_VIEWPORT_WIDTHS

/** Heights paired with FANTASIA_STORYBOOK_VIEWPORT_WIDTHS for iframe sizing and visual tests. */
export const FANTASIA_STORYBOOK_VIEWPORT_HEIGHTS = {
  phone: 667,
  mobile: 1024,
  tablet: 768,
  desktop: 1080,
  desktop2k: 1440,
  desktop4k: 2160
} as const

/** Storybook built-in full-canvas preset (100% iframe width and height). */
export const FANTASIA_STORYBOOK_RESPONSIVE_VIEWPORT_KEY = 'responsive' as const

/** Initial Storybook viewport; must match a key of FANTASIA_STORYBOOK_VIEWPORT_OPTIONS. */
export const FANTASIA_STORYBOOK_DEFAULT_VIEWPORT =
  FANTASIA_STORYBOOK_RESPONSIVE_VIEWPORT_KEY
