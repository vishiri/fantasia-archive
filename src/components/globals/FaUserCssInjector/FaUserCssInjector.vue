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

import { S_FaProgramStyling } from 'app/src/stores/S_FaProgramStyling'

const FA_USER_CSS_STYLE_ELEMENT_ID = 'faUserCss'

const programStylingStore = S_FaProgramStyling()
let styleElement: HTMLStyleElement | null = null

/**
 * Returns an existing or newly created 'style#faUserCss' in 'document.head'.
 */
function ensureStyleElement (): HTMLStyleElement | null {
  if (typeof document === 'undefined') {
    return null
  }
  const existing = document.getElementById(FA_USER_CSS_STYLE_ELEMENT_ID)
  if (existing instanceof HTMLStyleElement) {
    return existing
  }
  const created = document.createElement('style')
  created.id = FA_USER_CSS_STYLE_ELEMENT_ID
  created.setAttribute('type', 'text/css')
  created.setAttribute('data-fa-user-css', 'true')
  document.head.appendChild(created)
  return created
}

/**
 * Writes the given CSS string into the managed style node when it differs from the current text.
 */
function applyCss (css: string): void {
  if (styleElement === null) {
    return
  }
  if (styleElement.textContent !== css) {
    styleElement.textContent = css
  }
}

onMounted(() => {
  styleElement = ensureStyleElement()
  applyCss(programStylingStore.css)
})

watch(
  () => programStylingStore.css,
  (next) => {
    applyCss(next)
  }
)

onBeforeUnmount(() => {
  if (styleElement !== null && styleElement.parentNode !== null) {
    styleElement.parentNode.removeChild(styleElement)
  }
  styleElement = null
})
</script>
