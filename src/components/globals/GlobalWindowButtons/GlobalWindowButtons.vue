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
import { useGlobalWindowButtons } from './scripts/globalWindowButtons_manager'

const {
  isMaximized,
  minimizeWindow,
  resizeWindowThenRefreshMaximized,
  tryCloseWindow
} = useGlobalWindowButtons()
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
