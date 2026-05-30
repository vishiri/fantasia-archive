import { onBeforeUnmount, onMounted, watch } from 'vue'

import * as faUserCssInjectorHostModule from 'app/src/components/globals/_FaUserCssInjector/scripts/functions/faUserCssInjectorHostAndCssPayload'
import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'

import { createFaProjectUserCssInjector } from './functions/createFaProjectUserCssInjector'
import * as faProjectUserCssStyleElementModule from './functions/faProjectUserCssStyleElement'

const useFaProjectUserCssInjectorBinding = createFaProjectUserCssInjector({
  ensureProjectUserCssStyleElementInHead: (hostDocument) => {
    return faProjectUserCssStyleElementModule.ensureProjectUserCssStyleElementInHead(hostDocument)
  },
  getProjectStylingStore: () => S_FaProjectStyling(),
  onBeforeUnmount,
  onMounted,
  resolveFaUserCssInjectorEffectiveCssPayload: (cssLivePreview, css) => {
    return faUserCssInjectorHostModule.resolveFaUserCssInjectorEffectiveCssPayload(
      cssLivePreview,
      css
    )
  },
  resolveFaUserCssInjectorHostDocument: (host) => {
    return faUserCssInjectorHostModule.resolveFaUserCssInjectorHostDocument(host)
  },
  watch
})

export const useFaProjectUserCssInjector = useFaProjectUserCssInjectorBinding
