<template>
  <div
    v-ripple="templatesTabRippleBinding"
    role="button"
    tabindex="0"
    :class="tabClassList"
    :data-test-template-id="props.template.id"
    :data-test-validation-error="props.tabHasError ? 'true' : 'false'"
    data-test-locator="dialogProjectSettings-documentTemplates-tab"
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
        <template v-if="props.template.displayName.trim().length > 0">
          {{ props.template.displayName }}
        </template>
        <template v-else>
          {{ $t('dialogs.projectSettings.panels.documentTemplates.defaultNewTemplateName') }}
        </template>
      </span>
      <span
        v-if="showWorldAppendix"
        class="dialogProjectSettingsDocumentTemplatesTabItem__worldAppendix"
        data-test-locator="dialogProjectSettings-documentTemplates-tabWorldAppendix"
      >
        ({{ trimmedWorldAppendix }})
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'

defineOptions({
  name: 'DialogProjectSettingsDocumentTemplatesTabItem'
})

const props = withDefaults(
  defineProps<{
    isBeingDragged?: boolean
    isListDragging?: boolean
    isSelected: boolean
    tabHasError: boolean
    template: I_dialogProjectSettingsDocumentTemplateDraft
  }>(),
  {
    isBeingDragged: false,
    isListDragging: false
  }
)

const emit = defineEmits<{
  select: [id: string]
}>()

const templatesTabRipple = {
  early: true,
  keyCodes: [13, 32]
}

const templatesTabRippleBinding = computed(() => {
  if (props.isListDragging) {
    return false
  }
  return templatesTabRipple
})

const tabBlurTargetRef = ref<HTMLDivElement | null>(null)

const trimmedWorldAppendix = computed(() => props.template.worldAppendix.trim())

const showWorldAppendix = computed(() => trimmedWorldAppendix.value.length > 0)

function onTabClick (): void {
  emit('select', props.template.id)
  tabBlurTargetRef.value?.focus()
}

function onTabKeydown (event: KeyboardEvent): void {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return
  }
  event.preventDefault()
  emit('select', props.template.id)
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

<style lang="scss" src="./styles/DialogProjectSettings.documentTemplatesTabItem.unscoped.scss"></style>
