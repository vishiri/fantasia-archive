<template>
  <div
    class="projectHierarchyTree__openIconWrapper"
    data-test-locator="projectHierarchyTree-openIconWrapper"
    @click.stop="emit('click', $event)"
    @pointerdown.stop="emit('pointerdown', $event)"
  >
    <q-icon
      class="projectHierarchyTree__openIcon"
      :class="{ 'projectHierarchyTree__openIcon--open': visualExpanded }"
      data-test-locator="projectHierarchyTree-openIcon"
      name="play_arrow"
    />
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'

defineOptions({
  name: 'ProjectHierarchyTreeOpenIcon'
})

const props = defineProps<{
  expanded: boolean
  pendingExpandAnimation: boolean
}>()

const emit = defineEmits<{
  click: [event: MouseEvent]
  pointerdown: [event: PointerEvent]
}>()

const visualExpanded = ref(false)
let rafIds: number[] = []

function cancelScheduledFrames (): void {
  for (const rafId of rafIds) {
    cancelAnimationFrame(rafId)
  }
  rafIds = []
}

function syncVisualExpandedFromProps (): void {
  if (!props.expanded) {
    cancelScheduledFrames()
    visualExpanded.value = false
    return
  }
  if (!props.pendingExpandAnimation) {
    cancelScheduledFrames()
    visualExpanded.value = true
    return
  }
  cancelScheduledFrames()
  visualExpanded.value = false
  const firstRafId = requestAnimationFrame(() => {
    const secondRafId = requestAnimationFrame(() => {
      if (props.expanded) {
        visualExpanded.value = true
      }
    })
    rafIds = [secondRafId]
  })
  rafIds = [firstRafId]
}

watch(
  () => [props.expanded, props.pendingExpandAnimation] as const,
  syncVisualExpandedFromProps,
  {
    immediate: true
  }
)

onUnmounted(() => {
  cancelScheduledFrames()
})
</script>
