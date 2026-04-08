import {
  responsiveViewport,
  type Viewport
} from 'storybook/viewport'

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

/**
 * Storybook built-in full-canvas preset (100% iframe width and height).
 * Use with story-level globals.viewport.value so the preview is not locked to a pixel width.
 */
export const FANTASIA_STORYBOOK_RESPONSIVE_VIEWPORT_KEY = 'responsive' as const

/**
 * Initial Storybook viewport (Storybook 'Reset viewport', 100% iframe).
 * Must match a key of FANTASIA_STORYBOOK_VIEWPORT_OPTIONS; fixed-width presets stay in the toolbar.
 */
export const FANTASIA_STORYBOOK_DEFAULT_VIEWPORT =
  FANTASIA_STORYBOOK_RESPONSIVE_VIEWPORT_KEY

/**
 * Global Storybook viewport toolbar entries (parameters.viewport.options).
 * Wired once from preview so components, layouts, and pages share the same presets.
 */
export const FANTASIA_STORYBOOK_VIEWPORT_OPTIONS: Record<string, Viewport> = {
  [FANTASIA_STORYBOOK_RESPONSIVE_VIEWPORT_KEY]: responsiveViewport,
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
