import { onBeforeUnmount, onMounted, watch } from 'vue'

import { S_FaAppStyling } from 'app/src/stores/S_FaAppStyling'

import {
  applyFaUserCssToStyleElementIfNeeded,
  ensureFaUserCssStyleElementInHead
} from './functions/faUserCssInjectorStyleElement'
import {
  resolveFaUserCssInjectorEffectiveCssPayload,
  resolveFaUserCssInjectorHostDocument
} from './functions/faUserCssInjectorHostAndCssPayload'
import { createUseFaUserCssInjector } from './functions/createUseFaUserCssInjector'

const FA_USER_CSS_STYLE_ELEMENT_ID = 'faUserCss'

export const useFaUserCssInjector = createUseFaUserCssInjector({
  FA_USER_CSS_STYLE_ELEMENT_ID,
  applyFaUserCssToStyleElementIfNeeded,
  ensureFaUserCssStyleElementInHead,
  getAppStylingStore: () => S_FaAppStyling(),
  onBeforeUnmount,
  onMounted,
  resolveFaUserCssInjectorEffectiveCssPayload,
  resolveFaUserCssInjectorHostDocument,
  watch
})
