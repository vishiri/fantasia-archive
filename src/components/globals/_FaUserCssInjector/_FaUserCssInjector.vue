<template>
  <!--
    Renders an empty hidden span as a Vue template root. Owns a single 'style#faUserCss' element appended to
    'document.head' so user CSS applies across every route, layout, and embedded surface. Mounted at App.vue level
    (parent of <router-view />) so it survives MainLayout / ComponentTestingLayout / 404 transitions.
  -->
  <span
    aria-hidden="true"
    class="faUserCssInjectorHost"
    data-fa-user-css-host="true"
    hidden
  />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'

import { S_FaAppStyling } from 'app/src/stores/S_FaAppStyling'

import {
  resolveFaUserCssInjectorEffectiveCssPayload,
  resolveFaUserCssInjectorHostDocument
} from './scripts/faUserCssInjectorHostAndCssPayload'
import {
  applyFaUserCssToStyleElementIfNeeded,
  ensureFaUserCssStyleElementInHead
} from './scripts/faUserCssInjectorStyleElement'

defineOptions({
  name: '_FaUserCssInjector'
})

const FA_USER_CSS_STYLE_ELEMENT_ID = 'faUserCss'

const appStylingStore = S_FaAppStyling()
let styleElement: HTMLStyleElement | null = null

function effectiveUserCss (): string {
  return resolveFaUserCssInjectorEffectiveCssPayload(
    appStylingStore.cssLivePreview,
    appStylingStore.css
  )
}

onMounted(() => {
  styleElement = ensureFaUserCssStyleElementInHead(
    resolveFaUserCssInjectorHostDocument(globalThis),
    FA_USER_CSS_STYLE_ELEMENT_ID
  )
  applyFaUserCssToStyleElementIfNeeded(styleElement, effectiveUserCss())
})

watch(
  [() => appStylingStore.cssLivePreview, () => appStylingStore.css],
  () => {
    applyFaUserCssToStyleElementIfNeeded(styleElement, effectiveUserCss())
  }
)

onBeforeUnmount(() => {
  if (styleElement !== null && styleElement.parentNode !== null) {
    styleElement.parentNode.removeChild(styleElement)
  }
  styleElement = null
})
</script>
