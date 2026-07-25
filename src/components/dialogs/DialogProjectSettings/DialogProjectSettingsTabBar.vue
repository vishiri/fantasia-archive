<template>
  <div class="dialogProjectSettings__tabBarRoot">
    <q-tabs
      :model-value="props.selectedCategoryTab"
      class="dialogProjectSettings__tabs"
      active-color="primary-bright"
      align="left"
      @update:model-value="emit('update:selectedCategoryTab', $event)"
    >
      <q-tab
        :class="generalTabClassList"
        :name="generalTabKey"
        :label="$t('dialogs.projectSettings.categories.generalSettings.title')"
        :data-test-validation-error="props.generalTabHasError ? 'true' : 'false'"
        data-test-locator="dialogProjectSettings-tab-generalSettings"
      />
      <q-tab
        :class="worldsTabClassList"
        :name="worldsTabKey"
        :label="$t('dialogs.projectSettings.categories.worldsSettings.title')"
        :data-test-validation-error="props.worldsTabHasError ? 'true' : 'false'"
        data-test-locator="dialogProjectSettings-tab-worldsSettings"
      />
      <q-tab
        :class="documentTemplatesTabClassList"
        :name="documentTemplatesTabKey"
        :label="$t('dialogs.projectSettings.categories.documentTemplatesSettings.title')"
        :data-test-validation-error="props.documentTemplatesTabHasError ? 'true' : 'false'"
        data-test-locator="dialogProjectSettings-tab-documentTemplatesSettings"
      />
    </q-tabs>
    <div
      class="dialogProjectSettings__tabBarDivider fa-painted-divider--horizontal"
      data-test-locator="dialogProjectSettings-tabBarDivider"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import {
  FA_DIALOG_PROJECT_SETTINGS_DOCUMENT_TEMPLATES_TAB,
  FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB,
  FA_DIALOG_PROJECT_SETTINGS_WORLDS_TAB
} from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsDialogInput'

const props = defineProps<{
  documentTemplatesTabHasError: boolean
  generalTabHasError: boolean
  selectedCategoryTab: string
  worldsTabHasError: boolean
}>()

const emit = defineEmits<{
  'update:selectedCategoryTab': [value: string]
}>()

const generalTabKey = FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB
const worldsTabKey = FA_DIALOG_PROJECT_SETTINGS_WORLDS_TAB
const documentTemplatesTabKey = FA_DIALOG_PROJECT_SETTINGS_DOCUMENT_TEMPLATES_TAB

const generalTabClassList = computed(() => {
  const classList: Record<string, boolean> = {
    'dialogProjectSettings__tab--error': props.generalTabHasError,
    'fa-text-muted': !props.generalTabHasError && props.selectedCategoryTab !== generalTabKey
  }
  return classList
})

const worldsTabClassList = computed(() => {
  const classList: Record<string, boolean> = {
    'dialogProjectSettings__tab--error': props.worldsTabHasError,
    'fa-text-muted': !props.worldsTabHasError && props.selectedCategoryTab !== worldsTabKey
  }
  return classList
})

const documentTemplatesTabClassList = computed(() => {
  const classList: Record<string, boolean> = {
    'dialogProjectSettings__tab--error': props.documentTemplatesTabHasError,
    'fa-text-muted': !props.documentTemplatesTabHasError &&
      props.selectedCategoryTab !== documentTemplatesTabKey
  }
  return classList
})
</script>

<style lang="scss" src="./styles/DialogProjectSettings.tabError.unscoped.scss"></style>

<style lang="scss" scoped>
@use '../../../css/globals/faTabEdgeGlow.mixin.scss' as tabEdgeGlow;

.dialogProjectSettings__tabBarRoot {
  flex: 0 0 auto;
  padding: 0 $dialogProjectSettings-category-paddingX;
  /* Above dialog rim ::before/::after so tab chrome is not tinted into stepped cyan bands. */
  position: relative;
  z-index: $dialogProjectSettings-title-zIndex;
}

.dialogProjectSettings__tabs {
  overflow: visible;
  position: relative;
  z-index: $dialogProjectSettings-tabs-zIndex;

  :deep(.q-tabs__content) {
    overflow: visible;
  }

  :deep(.q-tab) {
    overflow: visible;

    @include tabEdgeGlow.fa-tab-edge-glow-kill-focus-helper;
  }

  :deep(.q-tab__indicator) {
    display: none;
  }

  /* Golden bottom bloom — shared fa-tab-edge-glow; overlaps painted divider. */
  :deep(.q-tab)::after {
    @include tabEdgeGlow.fa-tab-edge-glow-idle(bottom);
  }

  :deep(.q-tab--active)::after {
    @include tabEdgeGlow.fa-tab-edge-glow-active(bottom);
  }

  :deep(.q-tab:hover)::after {
    @include tabEdgeGlow.fa-tab-edge-glow-hover(bottom);
  }
}

.dialogProjectSettings__tabBarDivider {
  margin:
    $dialogProjectSettings-tabBarDivider-marginTop
    auto
    $dialogProjectSettings-tabBarDivider-marginBottom;
  position: relative;
  width: calc(100% - #{$dialogProjectSettings-tabBarDivider-widthSubtract});
  z-index: $dialogProjectSettings-tabBarDivider-zIndex;
}
</style>
