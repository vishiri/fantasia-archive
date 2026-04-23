<template>
  <div
    class="faFloatingWindowFrameResizeHandles"
    aria-hidden="true"
    data-test-locator="faFloatingWindowFrameResizeHandles"
    :style="rootStyle"
  >
    <div
      class="faFloatingWindowFrameResizeHandles__hit faFloatingWindowFrameResizeHandles__n"
      :class="{ 'faFloatingWindowFrameResizeHandles__hit--glow': edgeGlow.n }"
      @mouseenter="onHoverEnter('n')"
      @mouseleave="onHoverLeave"
      @pointerdown="down('n', $event)"
    />
    <div
      class="faFloatingWindowFrameResizeHandles__hit faFloatingWindowFrameResizeHandles__s"
      :class="{ 'faFloatingWindowFrameResizeHandles__hit--glow': edgeGlow.s }"
      @mouseenter="onHoverEnter('s')"
      @mouseleave="onHoverLeave"
      @pointerdown="down('s', $event)"
    />
    <div
      class="faFloatingWindowFrameResizeHandles__hit faFloatingWindowFrameResizeHandles__e"
      :class="{ 'faFloatingWindowFrameResizeHandles__hit--glow': edgeGlow.e }"
      @mouseenter="onHoverEnter('e')"
      @mouseleave="onHoverLeave"
      @pointerdown="down('e', $event)"
    />
    <div
      class="faFloatingWindowFrameResizeHandles__hit faFloatingWindowFrameResizeHandles__w"
      :class="{ 'faFloatingWindowFrameResizeHandles__hit--glow': edgeGlow.w }"
      @mouseenter="onHoverEnter('w')"
      @mouseleave="onHoverLeave"
      @pointerdown="down('w', $event)"
    />
    <div
      class="faFloatingWindowFrameResizeHandles__hit faFloatingWindowFrameResizeHandles__corner faFloatingWindowFrameResizeHandles__nw"
      :class="{ 'faFloatingWindowFrameResizeHandles__hit--glow': activeHandle === 'nw' }"
      @mouseenter="onHoverEnter('nw')"
      @mouseleave="onHoverLeave"
      @pointerdown="down('nw', $event)"
    />
    <div
      class="faFloatingWindowFrameResizeHandles__hit faFloatingWindowFrameResizeHandles__corner faFloatingWindowFrameResizeHandles__ne"
      :class="{ 'faFloatingWindowFrameResizeHandles__hit--glow': activeHandle === 'ne' }"
      @mouseenter="onHoverEnter('ne')"
      @mouseleave="onHoverLeave"
      @pointerdown="down('ne', $event)"
    />
    <div
      class="faFloatingWindowFrameResizeHandles__hit faFloatingWindowFrameResizeHandles__corner faFloatingWindowFrameResizeHandles__sw"
      :class="{ 'faFloatingWindowFrameResizeHandles__hit--glow': activeHandle === 'sw' }"
      @mouseenter="onHoverEnter('sw')"
      @mouseleave="onHoverLeave"
      @pointerdown="down('sw', $event)"
    />
    <div
      class="faFloatingWindowFrameResizeHandles__hit faFloatingWindowFrameResizeHandles__corner faFloatingWindowFrameResizeHandles__se"
      :class="{ 'faFloatingWindowFrameResizeHandles__hit--glow': activeHandle === 'se' }"
      @mouseenter="onHoverEnter('se')"
      @mouseleave="onHoverLeave"
      @pointerdown="down('se', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useFaFloatingWindowFrameResizeHandlesHover } from 'app/src/components/floatingWindows/FaFloatingWindowFrameResizeHandles/scripts/faFloatingWindowFrameResizeHandlesHover'
import { FA_FLOATING_WINDOW_RESIZE_HANDLE_PX } from 'app/src/scripts/floatingWindows/faFloatingWindowResizeGeometry'
import type { T_faFloatingWindowResizeEdge } from 'app/src/scripts/floatingWindows/useFaFloatingWindowResize'

defineOptions({
  name: 'FaFloatingWindowFrameResizeHandles'
})

const props = defineProps<{
  onResizePointerDown: (edge: T_faFloatingWindowResizeEdge, e: PointerEvent) => void
}>()

const { activeHandle, beginResizeHighlight, edgeGlow, onHoverEnter, onHoverLeave } =
  useFaFloatingWindowFrameResizeHandlesHover()

const rootStyle = computed(() => ({
  '--fa-fw-resize': `${FA_FLOATING_WINDOW_RESIZE_HANDLE_PX}px`
}))

function down (edge: T_faFloatingWindowResizeEdge, e: PointerEvent): void {
  beginResizeHighlight(edge)
  props.onResizePointerDown(edge, e)
}
</script>

<style lang="scss" scoped>
.faFloatingWindowFrameResizeHandles {
  box-sizing: border-box;
  inset: 0;
  pointer-events: none;
  position: absolute;
  touch-action: none;
  z-index: 3;

  $corner: var(--fa-fw-resize, 8px);
  $z-edge: 1;
  $z-corner: 2;

  &__hit {
    background-color: rgba($primary-bright, 0);
    pointer-events: auto;
    position: absolute;
    transition: background-color 0.2s ease-in-out;

    &--glow {
      background-color: rgba($primary-bright, 0.1);
    }
  }

  &__n {
    cursor: ns-resize;
    height: $corner;
    left: 0;
    right: 0;
    top: 0;
    z-index: $z-edge;
  }

  &__s {
    bottom: 0;
    cursor: ns-resize;
    height: $corner;
    left: 0;
    right: 0;
    z-index: $z-edge;
  }

  &__e {
    bottom: 0;
    cursor: ew-resize;
    right: 0;
    top: 0;
    width: $corner;
    z-index: $z-edge;
  }

  &__w {
    bottom: 0;
    cursor: ew-resize;
    left: 0;
    top: 0;
    width: $corner;
    z-index: $z-edge;
  }

  &__corner {
    z-index: $z-corner;
  }

  &__nw {
    cursor: nwse-resize;
    height: $corner;
    left: 0;
    top: 0;
    width: $corner;
  }

  &__ne {
    cursor: nesw-resize;
    height: $corner;
    right: 0;
    top: 0;
    width: $corner;
  }

  &__sw {
    bottom: 0;
    cursor: nesw-resize;
    height: $corner;
    left: 0;
    width: $corner;
  }

  &__se {
    bottom: 0;
    cursor: nwse-resize;
    height: $corner;
    right: 0;
    width: $corner;
  }
}
</style>
