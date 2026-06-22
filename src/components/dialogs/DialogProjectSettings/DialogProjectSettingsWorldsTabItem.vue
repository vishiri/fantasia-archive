<template>
  <div
    v-ripple="worldsTabRippleBinding"
    role="button"
    tabindex="0"
    :class="tabClassList"
    :data-test-validation-error="props.tabHasError ? 'true' : 'false'"
    :data-test-world-id="props.world.id"
    data-test-locator="dialogProjectSettings-worlds-tab"
    @click="onTabClick"
    @keydown="onTabKeydown"
  >
    <div
      ref="tabBlurTargetRef"
      class="q-focus-helper"
      tabindex="-1"
    />
    <div class="faVerticalDraggableTabs__tabContent relative-position">
      <span class="faVerticalDraggableTabs__tabLabel">
        <template v-if="resolvedDisplayName.length > 0">
          {{ resolvedDisplayName }}
        </template>
        <template v-else>
          {{ $t('dialogs.projectSettings.panels.worlds.defaultNewWorldName') }}
        </template>
      </span>
    </div>
    <span
      v-if="showWorldColorSwatch"
      class="dialogProjectSettingsWorldsTabItem__colorSwatch"
      aria-hidden="true"
      data-test-locator="dialogProjectSettings-worlds-tabColorSwatch"
      :style="worldColorSwatchStyle"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import { resolveDialogProjectSettingsWorldResolvedDisplayName } from './scripts/dialogProjectSettingsWorldsDisplayNameDraft'

defineOptions({
  name: 'DialogProjectSettingsWorldsTabItem'
})

const props = withDefaults(
  defineProps<{
    currentLanguageCode: T_faUserSettingsLanguageCode
    isBeingDragged?: boolean
    isListDragging?: boolean
    isSelected: boolean
    tabHasError: boolean
    world: I_dialogProjectSettingsWorldDraft
  }>(),
  {
    isBeingDragged: false,
    isListDragging: false
  }
)

const emit = defineEmits<{
  select: [id: string]
}>()

const worldsTabRipple = {
  early: true,
  keyCodes: [13, 32]
}

const worldsTabRippleBinding = computed(() => {
  if (props.isListDragging) {
    return false
  }
  return worldsTabRipple
})

const tabBlurTargetRef = ref<HTMLDivElement | null>(null)

const resolvedDisplayName = computed(() => {
  return resolveDialogProjectSettingsWorldResolvedDisplayName(
    props.world,
    props.currentLanguageCode
  )
})

const trimmedWorldColor = computed(() => props.world.color.trim())

const showWorldColorSwatch = computed(() => trimmedWorldColor.value.length > 0)

const worldColorSwatchStyle = computed(() => ({
  backgroundColor: trimmedWorldColor.value
}))

function onTabClick (): void {
  emit('select', props.world.id)
  tabBlurTargetRef.value?.focus()
}

function onTabKeydown (event: KeyboardEvent): void {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return
  }
  event.preventDefault()
  emit('select', props.world.id)
}

const tabClassList = computed(() => {
  const classList: Record<string, boolean> = {
    faVerticalDraggableTabs__tab: true,
    'faVerticalDraggableTabs__tab--active': props.isSelected,
    'faVerticalDraggableTabs__tab--dragging': props.isBeingDragged,
    'faVerticalDraggableTabs__tab--error': props.tabHasError,
    'fa-text-muted': !props.tabHasError && !props.isSelected,
    'q-focusable': !props.isListDragging,
    'q-hoverable': !props.isListDragging,
    'relative-position': true
  }
  return classList
})
</script>
