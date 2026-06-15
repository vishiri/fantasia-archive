<template>
  <div class="dialogProjectSettings__tabBarRoot">
    <q-tabs
      :model-value="props.selectedCategoryTab"
      class="dialogProjectSettings__tabs"
      active-color="primary-bright"
      indicator-color="primary-bright"
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

    <q-separator />
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
.dialogProjectSettings__tabBarRoot {
  flex: 0 0 auto;
  padding: 0 $dialogProjectSettings-category-paddingX;
}
</style>
