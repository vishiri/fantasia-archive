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
      class="globalWindowButtons__button globalWindowButtons__minimize"
      data-test="globalWindowButtons-button-minimize"
      @click="minimizeWindow()"
    >
      <q-tooltip
        :delay="1000"
        :offset="[0, 5]"
      >
        {{ $t('GlobalWindowButtons.minimizeButton') }}
      </q-tooltip>
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
      class="globalWindowButtons__button globalWindowButtons__resize"
      data-test="globalWindowButtons-button-resize"
      @click="[resizeWindow(),checkIfWindowMaximized()]"
    >
      <q-tooltip
        :delay="1000"
        :offset="[0, 5]"
      >
        {{ isMaximized ? $t('GlobalWindowButtons.resizeButton') : $t('GlobalWindowButtons.maximizeButton') }}
      </q-tooltip>
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
      class="globalWindowButtons__button globalWindowButtons__close"
      data-test="globalWindowButtons-button-close"
      @click="tryCloseWindow()"
    >
      <q-tooltip
        :delay="1000"
        :offset="[0, 5]"
      >
        {{ $t('GlobalWindowButtons.close') }}
      </q-tooltip>
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
const minimizeWindow = () => {
  if (process.env.MODE === 'electron') {
    window.faContentBridgeAPIs.faWindowControl.minimizeWindow()
  }
}

/**
 * Triggers resize of the window by the min/max button click
 */
const resizeWindow = () => {
  if (process.env.MODE === 'electron') {
    window.faContentBridgeAPIs.faWindowControl.resizeWindow()
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
const tryCloseWindow = () => {
  // TODO add project close checking
  if (process.env.MODE === 'electron') {
    window.faContentBridgeAPIs.faWindowControl.closeWindow()
  }
}

/**
Checks if the window is maximized and sets local variable accordingly
*/
const checkIfWindowMaximized = () => {
  if (process.env.MODE === 'electron') {
    isMaximized.value = window.faContentBridgeAPIs.faWindowControl.checkWindowMaximized()
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

  checkIfWindowMaximized()

  checkerInterval = window.setInterval(() => {
    checkIfWindowMaximized()
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
  position: fixed;
  z-index: 99999999;
  right: 0;
  top: 0;
  border-radius: 0;
  height: $globalWindowButtons_height;
  color: $globalWindowButtons_color;
  -webkit-app-region: no-drag;

  &__button {
    &:hover,
    &:focus {
      color: $globalWindowButtons_hoverColor;
    }
  }

  &__close {
    &:hover,
    &:focus {
      color: $globalWindowButtons_close_hoverColor;
    }
  }
}
</style>
