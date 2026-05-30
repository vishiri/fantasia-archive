import {
  responsiveViewport,
  type Viewport
} from 'storybook/viewport'

import {
  FANTASIA_STORYBOOK_RESPONSIVE_VIEWPORT_KEY,
  FANTASIA_STORYBOOK_VIEWPORT_HEIGHTS,
  FANTASIA_STORYBOOK_VIEWPORT_WIDTHS
} from 'app/types/I_fantasiaStorybookViewport'

export {
  FANTASIA_STORYBOOK_DEFAULT_VIEWPORT,
  FANTASIA_STORYBOOK_RESPONSIVE_VIEWPORT_KEY,
  FANTASIA_STORYBOOK_VIEWPORT_HEIGHTS,
  FANTASIA_STORYBOOK_VIEWPORT_WIDTHS
} from 'app/types/I_fantasiaStorybookViewport'

const px = (value: number): string => `${value}px`

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
