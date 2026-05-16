<template>
  <!--
    Renders nothing visible. Owns 'style#faProjectUserCss' after 'style#faUserCss' while SQLite-backed
    Pinia mirrors project-scoped CSS for the active '.faproject'.
  -->
  <span
    aria-hidden="true"
    class="faProjectUserCssInjectorHost"
    data-fa-project-user-css-host="true"
    hidden
  />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'

import {
  resolveFaUserCssInjectorEffectiveCssPayload,
  resolveFaUserCssInjectorHostDocument
} from 'app/src/components/globals/_FaUserCssInjector/scripts/faUserCssInjectorHostAndCssPayload'
import { ensureProjectUserCssStyleElementInHead } from 'app/src/components/globals/_FaProjectUserCssInjector/scripts/faProjectUserCssStyleElement'
import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'

defineOptions({
  name: '_FaProjectUserCssInjector'
})

const projectStylingStore = S_FaProjectStyling()
let managedStyleEl: HTMLStyleElement | null = null

function effectiveProjectCss (): string {
  const previewValue = projectStylingStore.cssLivePreview
  const persisted = projectStylingStore.css

  const resolvedEffective = resolveFaUserCssInjectorEffectiveCssPayload(
    previewValue,
    persisted
  )
  return resolvedEffective
}

function syncProjectCssStyle (): void {
  const hostDocument = resolveFaUserCssInjectorHostDocument(globalThis)
  if (hostDocument === undefined) {
    return
  }
  const payload = effectiveProjectCss()
  const payloadEmptyTrimmed = payload.trim().length === 0

  if (payloadEmptyTrimmed === true && managedStyleEl !== null) {
    const detachParent = managedStyleEl.parentNode
    if (detachParent !== null) {
      detachParent.removeChild(managedStyleEl)
    }
    managedStyleEl = null
  }

  const shouldEnsureAndWriteCss = payloadEmptyTrimmed !== true

  if (!shouldEnsureAndWriteCss) {
    return
  }

  const ensuredEl = ensureProjectUserCssStyleElementInHead(hostDocument)

  const ensuredMissing = ensuredEl === null
  if (ensuredMissing) {
    return
  }

  managedStyleEl = ensuredEl

  if (managedStyleEl.textContent !== payload) {
    managedStyleEl.textContent = payload
  }
}

function onMountedInjector (): void {
  syncProjectCssStyle()
}

function onUnmountInjector (): void {
  if (managedStyleEl !== null && managedStyleEl.parentNode !== null) {
    managedStyleEl.parentNode.removeChild(managedStyleEl)
  }
  managedStyleEl = null
}

onMounted(onMountedInjector)

watch(
  [() => projectStylingStore.cssLivePreview, () => projectStylingStore.css],
  () => {
    syncProjectCssStyle()
  }
)

onBeforeUnmount(onUnmountInjector)
</script>
