import {
  FOUNDATION_TYPOGRAPHY_HEADINGS,
  FOUNDATION_TYPOGRAPHY_HELPERS,
  FOUNDATION_TYPOGRAPHY_WEIGHTS
} from './functions/foundationTypographySamples'

import { createUseFoundationTextList } from './functions/createUseFoundationTextList'

export const useFoundationTextList = createUseFoundationTextList({
  headingRows: FOUNDATION_TYPOGRAPHY_HEADINGS,
  helperRows: FOUNDATION_TYPOGRAPHY_HELPERS,
  weightRows: FOUNDATION_TYPOGRAPHY_WEIGHTS
})
