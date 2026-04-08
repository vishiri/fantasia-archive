import type { Viewport } from 'storybook/viewport'

/**
 * Canonical Storybook iframe widths (px). Toolbar labels use the same caps as product breakpoints.
 * Import from preview, Playwright visual config, or other workspace tooling—do not duplicate literals.
 */
export const FANTASIA_STORYBOOK_VIEWPORT_WIDTHS = {
  phone: 375,
  mobile: 768,
  tablet: 1024,
  desktop: 1920,
  desktop2k: 2560,
  desktop4k: 3840
} as const

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

const px = (value: number): string => `${value}px`

/** Default toolbar selection; must match a key of FANTASIA_STORYBOOK_VIEWPORT_OPTIONS. */
export const FANTASIA_STORYBOOK_DEFAULT_VIEWPORT: T_fantasiaStorybookViewportKey = 'desktop'

/**
 * Global Storybook viewport toolbar entries (parameters.viewport.options).
 * Wired once from preview so components, layouts, and pages share the same presets.
 */
export const FANTASIA_STORYBOOK_VIEWPORT_OPTIONS: Record<string, Viewport> = {
  phone: {
    name: 'Phone (375px max)',
    type: 'mobile',
    styles: {
      height: px(FANTASIA_STORYBOOK_VIEWPORT_HEIGHTS.phone),
      width: px(FANTASIA_STORYBOOK_VIEWPORT_WIDTHS.phone)
    }
  },
  mobile: {
    name: 'Mobile (768px max)',
    type: 'mobile',
    styles: {
      height: px(FANTASIA_STORYBOOK_VIEWPORT_HEIGHTS.mobile),
      width: px(FANTASIA_STORYBOOK_VIEWPORT_WIDTHS.mobile)
    }
  },
  tablet: {
    name: 'Tablet (1024px max)',
    type: 'tablet',
    styles: {
      height: px(FANTASIA_STORYBOOK_VIEWPORT_HEIGHTS.tablet),
      width: px(FANTASIA_STORYBOOK_VIEWPORT_WIDTHS.tablet)
    }
  },
  desktop: {
    name: 'Desktop (1920px max)',
    type: 'desktop',
    styles: {
      height: px(FANTASIA_STORYBOOK_VIEWPORT_HEIGHTS.desktop),
      width: px(FANTASIA_STORYBOOK_VIEWPORT_WIDTHS.desktop)
    }
  },
  desktop2k: {
    name: '2K desktop (2560px max)',
    type: 'desktop',
    styles: {
      height: px(FANTASIA_STORYBOOK_VIEWPORT_HEIGHTS.desktop2k),
      width: px(FANTASIA_STORYBOOK_VIEWPORT_WIDTHS.desktop2k)
    }
  },
  desktop4k: {
    name: '4K desktop (3840px max)',
    type: 'desktop',
    styles: {
      height: px(FANTASIA_STORYBOOK_VIEWPORT_HEIGHTS.desktop4k),
      width: px(FANTASIA_STORYBOOK_VIEWPORT_WIDTHS.desktop4k)
    }
  }
}
