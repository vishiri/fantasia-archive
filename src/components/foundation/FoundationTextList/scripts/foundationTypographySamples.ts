import type {
  I_foundationTypographyHeading,
  I_foundationTypographyHelper,
  I_foundationTypographyWeight
} from '../FoundationTextList.types'

/**
 * Quasar typography scale (text-h*, subtitle, body, caption, overline).
 * @see https://quasar.dev/style/typography
 */
export const FOUNDATION_TYPOGRAPHY_HEADINGS: I_foundationTypographyHeading[] = [
  {
    className: 'text-h1',
    label: 'Headline 1',
    sample: 'Headline 1 — text-h1',
    tag: 'h1'
  },
  {
    className: 'text-h2',
    label: 'Headline 2',
    sample: 'Headline 2 — text-h2',
    tag: 'h2'
  },
  {
    className: 'text-h3',
    label: 'Headline 3',
    sample: 'Headline 3 — text-h3',
    tag: 'h3'
  },
  {
    className: 'text-h4',
    label: 'Headline 4',
    sample: 'Headline 4 — text-h4',
    tag: 'h4'
  },
  {
    className: 'text-h5',
    label: 'Headline 5',
    sample: 'Headline 5 — text-h5',
    tag: 'h5'
  },
  {
    className: 'text-h6',
    label: 'Headline 6',
    sample: 'Headline 6 — text-h6',
    tag: 'h6'
  },
  {
    className: 'text-subtitle1',
    label: 'Subtitle 1',
    sample: 'Subtitle 1 — text-subtitle1',
    tag: 'div'
  },
  {
    className: 'text-subtitle2',
    label: 'Subtitle 2',
    sample: 'Subtitle 2 — text-subtitle2',
    tag: 'div'
  },
  {
    className: 'text-body1',
    label: 'Body 1',
    sample: 'Body 1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur unde suscipit, quam beatae rerum inventore consectetur.',
    tag: 'p'
  },
  {
    className: 'text-body2',
    label: 'Body 2',
    sample: 'Body 2. Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate aliquid ad quas sunt voluptatum officia dolorum cumque.',
    tag: 'p'
  },
  {
    className: 'text-caption',
    label: 'Caption',
    sample: 'Caption — text-caption',
    tag: 'div'
  },
  {
    className: 'text-overline',
    label: 'Overline',
    sample: 'Overline — text-overline',
    tag: 'div'
  }
]

/**
 * Quasar font-weight helpers.
 * @see https://quasar.dev/style/typography
 */
export const FOUNDATION_TYPOGRAPHY_WEIGHTS: I_foundationTypographyWeight[] = [
  {
    className: 'text-weight-thin',
    label: 'Thin (100)'
  },
  {
    className: 'text-weight-light',
    label: 'Light (300)'
  },
  {
    className: 'text-weight-regular',
    label: 'Regular (400)'
  },
  {
    className: 'text-weight-medium',
    label: 'Medium (500)'
  },
  {
    className: 'text-weight-bold',
    label: 'Bold (700)'
  },
  {
    className: 'text-weight-bolder',
    label: 'Bolder (900)'
  }
]

/**
 * Quasar text CSS helper classes (alignment, decoration, transform).
 * @see https://quasar.dev/style/typography
 */
export const FOUNDATION_TYPOGRAPHY_HELPERS: I_foundationTypographyHelper[] = [
  {
    className: 'text-left',
    demoPhrase: 'Aligned left (text-left)',
    description: 'Align text to the left'
  },
  {
    className: 'text-right',
    demoPhrase: 'Aligned right (text-right)',
    description: 'Align text to the right'
  },
  {
    className: 'text-center',
    demoPhrase: 'Centered (text-center)',
    description: 'Align text to the center'
  },
  {
    className: 'text-justify',
    demoPhrase: 'Justified block. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    description: 'Justified text'
  },
  {
    className: 'text-bold',
    demoPhrase: 'Bold via text-bold',
    description: 'Bold (helper)'
  },
  {
    className: 'text-italic',
    demoPhrase: 'Italic via text-italic',
    description: 'Italic'
  },
  {
    className: 'text-no-wrap',
    demoPhrase: 'Single long line that should not wrap when the viewport is narrow — text-no-wrap',
    description: 'Non-wrapping (nowrap)'
  },
  {
    className: 'text-strike',
    demoPhrase: 'Struck through (text-strike)',
    description: 'Line-through'
  },
  {
    className: 'text-uppercase',
    demoPhrase: 'uppercase sample phrase',
    description: 'Uppercase transform'
  },
  {
    className: 'text-lowercase',
    demoPhrase: 'LOWERCASE SAMPLE PHRASE',
    description: 'Lowercase transform'
  },
  {
    className: 'text-capitalize',
    demoPhrase: 'capitalize each word here',
    description: 'Capitalize words'
  }
]
