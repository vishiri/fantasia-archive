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
    <div class="dialogProjectSettingsDocumentTemplatesTabItem__labelRow">
      <div class="dialogProjectSettingsDocumentTemplatesTabItem__titleRow">
        <q-icon
          class="dialogProjectSettingsDocumentTemplatesTabItem__tabIcon"
          :data-test-icon-name="tabIconName"
          data-test-locator="dialogProjectSettings-documentTemplates-tabIcon"
          :name="tabIconName"
        />
        <div class="dialogProjectSettingsDocumentTemplatesTabItem__titleContent relative-position">
          <div class="faVerticalDraggableTabs__tabContent relative-position">
            <span class="faVerticalDraggableTabs__tabLabel">
              <template v-if="resolvedTitle.length > 0">
                {{ resolvedTitle }}
              </template>
              <template v-else>
                {{ $t('dialogs.projectSettings.panels.documentTemplates.defaultNewTemplateName') }}
              </template>
            </span>
          </div>
        </div>
        <q-icon
          v-if="showMissingTranslationsWarning"
          class="dialogProjectSettingsDocumentTemplatesTabItem__missingTranslationsWarning"
          color="warning"
          data-test-locator="dialogProjectSettings-documentTemplates-tabMissingTranslationsWarning"
          :data-test-tooltip-text="missingTranslationsWarningTooltip"
          name="mdi-alert"
          size="16px"
          @click.stop
        >
          <q-tooltip content-class="dialogProjectSettings__fieldHelpTooltip">
            <FaMultilineTooltipBody :text="missingTranslationsWarningTooltip" />
          </q-tooltip>
        </q-icon>
      </div>
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
import { useI18n } from 'vue-i18n'

import FaMultilineTooltipBody from 'app/src/components/elements/FaMultilineTooltipBody/FaMultilineTooltipBody.vue'
import { FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES } from 'app/i18n/faUserSettingsLanguageDisplayNames'
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import { faUserSettingsLanguageCodeToNamesKey } from 'app/types/faUserSettingsLanguageRegistry'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import { FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON } from 'app/types/I_faIconPickerInput'
import {
  isDialogProjectSettingsDocumentTemplateMissingCurrentLanguageTranslations,
  resolveDialogProjectSettingsDocumentTemplateMissingTranslationWarningTooltip,
  resolveDialogProjectSettingsDocumentTemplateResolvedTitle
} from './scripts/dialogProjectSettingsDocumentTemplatesDraft'
import { resolveDialogProjectSettingsDocumentTemplateResolvedWorldAppendix } from './scripts/dialogProjectSettingsDocumentTemplateWorldAppendixDraft'

defineOptions({
  name: 'DialogProjectSettingsDocumentTemplatesTabItem'
})

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    currentLanguageCode: T_faUserSettingsLanguageCode
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

const trimmedWorldAppendix = computed(() => {
  return resolveDialogProjectSettingsDocumentTemplateResolvedWorldAppendix(
    props.template,
    props.currentLanguageCode
  )
})

const resolvedTitle = computed(() => {
  return resolveDialogProjectSettingsDocumentTemplateResolvedTitle(
    props.template,
    props.currentLanguageCode
  )
})

const showMissingTranslationsWarning = computed(() => {
  return isDialogProjectSettingsDocumentTemplateMissingCurrentLanguageTranslations(
    props.template,
    props.currentLanguageCode
  )
})

const missingTranslationsWarningTooltip = computed(() => {
  return resolveDialogProjectSettingsDocumentTemplateMissingTranslationWarningTooltip({
    activeLanguageCode: props.currentLanguageCode,
    readFallbackLanguageName: (languageCode) => {
      return FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES[faUserSettingsLanguageCodeToNamesKey(languageCode)]
    },
    template: props.template,
    translate: (key, params) => t(key, params ?? {})
  })
})

const showWorldAppendix = computed(() => trimmedWorldAppendix.value.length > 0)

const trimmedIcon = computed(() => props.template.icon.trim())

const tabIconName = computed(() => {
  if (trimmedIcon.value.length > 0) {
    return trimmedIcon.value
  }
  return FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON
})

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
