<template>
  <!-- App base-control button-group -->
  <q-btn-group
    flat
    class="globalWindowButtons"
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
  background-color: $globalWindowButtons-backgroundColor;
  border-radius: 0;
  color: $globalWindowButtons-color;
  height: $globalWindowButtons-height;
  position: fixed;
  right: 0;
  top: 0;
  z-index: $globalWindowButtons-zIndex;

  /* Always present so opacity can fade with Quasar dialog backdrop (q-transition--fade). */
  &::after {
    background: $globalWindowButtons-dialogOverlay-background;
    content: '';
    inset: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    transition: $globalWindowButtons-dialogOverlay-transition;
    z-index: $globalWindowButtons-dialogOverlay-zIndex;
  }

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

<style lang="scss">
/* Unscoped: body.q-body--prevent-scroll is outside the SFC root.
 * Quasar sets this class when a modal (non-seamless) QDialog backdrop is active —
 * not q-body--dialog (that class is maximized-dialog only). */
body.q-body--prevent-scroll .globalWindowButtons::after {
  opacity: 1;
}
</style>
