<template>
  <div class="dialogProjectSettings__leftColumnRoot">
    <q-tabs
      :model-value="props.selectedCategoryTab"
      vertical
      class="dialogProjectSettings__tabs"
      active-color="primary-bright"
      indicator-color="primary-bright"
      @update:model-value="emit('update:selectedCategoryTab', $event)"
    >
      <q-tab
        :class="{ 'fa-text-muted': props.selectedCategoryTab !== generalTabKey }"
        :name="generalTabKey"
        :label="$t('dialogs.projectSettings.categories.generalSettings.title')"
        data-test-locator="dialogProjectSettings-tab-generalSettings"
      />
    </q-tabs>
  </div>
</template>

<script setup lang="ts">
import { FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB } from 'app/src/components/dialogs/DialogProjectSettings/scripts/dialogProjectSettingsConstants'

const props = defineProps<{
  selectedCategoryTab: string
}>()

const emit = defineEmits<{
  'update:selectedCategoryTab': [value: string]
}>()

const generalTabKey = FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB
</script>

<style lang="scss" scoped>
.dialogProjectSettings__leftColumnRoot {
  display: contents;
}

.dialogProjectSettings__tabs {
  position: relative;
}
</style>
