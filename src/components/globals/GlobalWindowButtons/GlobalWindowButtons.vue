<template>
  <!-- App base-control button-group -->
  <q-btn-group
    flat
    class="globalWindowButtons bg-dark"
  >
    <!-- Minimize button -->
    <q-btn
      flat
      dark
      size="xs"
      :ripple="false"
      class="globalWindowButtons__button globalWindowButtons__minimize"
      :aria-label="$t('globalWindowButtons.minimizeButton')"
      data-test-locator="globalWindowButtons-button-minimize"
      @click="minimizeWindow()"
    >
      <q-icon
        size="16px"
        name="mdi-window-minimize"
      />
    </q-btn>

    <!-- MinMax button -->
    <q-btn
      flat
      dark
      size="xs"
      :ripple="false"
      class="globalWindowButtons__button globalWindowButtons__resize"
      :aria-label="isMaximized ? $t('globalWindowButtons.resizeButton') : $t('globalWindowButtons.maximizeButton')"
      data-test-locator="globalWindowButtons-button-resize"
      @click="resizeWindowThenRefreshMaximized()"
    >
      <q-icon
        size="16px"
        :name="(isMaximized)
          ? 'mdi-window-restore'
          : 'mdi-window-maximize'"
      />
    </q-btn>

    <!-- Close button -->
    <q-btn
      flat
      dark
      size="xs"
      :ripple="false"
      class="globalWindowButtons__button globalWindowButtons__close"
      :aria-label="$t('globalWindowButtons.close')"
      data-test-locator="globalWindowButtons-button-close"
      @click="tryCloseWindow()"
    >
      <q-icon
        size="16px"
        name="mdi-window-close"
      />
    </q-btn>
  </q-btn-group>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { Ref } from 'vue'

/**
 * Triggers minimize of the window by the minimize button click
 */
const minimizeWindow = async () => {
  if (process.env.MODE === 'electron' && window.faContentBridgeAPIs?.faWindowControl) {
    await window.faContentBridgeAPIs.faWindowControl.minimizeWindow()
  }
}

/**
 * Triggers resize of the window by the min/max button click, then refreshes maximized state.
 */
const resizeWindowThenRefreshMaximized = async () => {
  if (process.env.MODE === 'electron' && window.faContentBridgeAPIs?.faWindowControl) {
    await window.faContentBridgeAPIs.faWindowControl.resizeWindow()
    await checkIfWindowMaximized()
  }
}

/**
 * Triggers checking of the current app state by the close button click.
 * This functionality checks the following:

 * 1. If the app has any projects opened to begin with at the moment
 * 2. If the project has any pending chnages to it

 * If both is found to be true, then an appropriate dialog is opened.
 * Otherwise, the app simply closes.
 */
const tryCloseWindow = async () => {
  // TODO add project close checking
  if (process.env.MODE === 'electron' && window.faContentBridgeAPIs?.faWindowControl) {
    await window.faContentBridgeAPIs.faWindowControl.closeWindow()
  }
}

/**
Checks if the window is maximized and sets local variable accordingly
*/
const checkIfWindowMaximized = async () => {
  if (process.env.MODE === 'electron' && window.faContentBridgeAPIs?.faWindowControl) {
    isMaximized.value = await window.faContentBridgeAPIs.faWindowControl.checkWindowMaximized()
  }
}

/**
 * Determines if the window is currently maximized or not
 */
const isMaximized: Ref<boolean> = ref(true)

/**
 * Window interval checker variable
 */
let checkerInterval: number

/**
 * Hook up a interval timer on mount for continuous checking
 * This is done due to the fact that dragging via the top header bar doesn't properly fire "drag" event
 * Async due to UI render blocking
 */
onMounted(async () => {
  window.clearInterval(checkerInterval)

  await checkIfWindowMaximized()

  checkerInterval = window.setInterval(() => {
    void checkIfWindowMaximized()
  }, 100)
})

/**
 *Unhook the interval timer on unmounting in order to prevent left-over intervals ticking in the app
 * Async due to UI render blocking
 */
onUnmounted(async () => {
  window.clearInterval(checkerInterval)
})

</script>

<style lang="scss" scoped>
.globalWindowButtons {
  -webkit-app-region: no-drag;
  border-radius: 0;
  color: $globalWindowButtons-color;
  height: $globalWindowButtons-height;
  position: fixed;
  right: 0;
  top: 0;
  z-index: $globalWindowButtons-zIndex;

  &__button {
    &:hover,
    &:focus {
      color: $globalWindowButtons-hoverColor;
    }
  }

  &__close {
    &:hover,
    &:focus {
      color: $globalWindowButtons-close-hoverColor;
    }
  }
}
</style>
