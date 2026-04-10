<script setup lang="ts">
import type { I_programCategoryRenderItem } from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.types'
import DialogProgramSettingsSettingBlock from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettingsSettingBlock.vue'
import { showNonLastSeparator } from 'app/src/components/dialogs/DialogProgramSettings/scripts/programSettingsHelpers'

defineProps<{
  category: I_programCategoryRenderItem
  categoryKey: string
  displayMode: 'tab' | 'search'
}>()

const emit = defineEmits<{
  'update-setting': [key: string, value: boolean]
}>()

function categoryTitleLocator (mode: 'tab' | 'search'): string {
  return mode === 'tab' ? 'dialogProgramSettings-categoryTitle' : 'dialogProgramSettings-search-categoryTitle'
}

function subCategoryTitleLocator (mode: 'tab' | 'search'): string {
  return mode === 'tab' ? 'dialogProgramSettings-subcategoryTitle' : 'dialogProgramSettings-search-subcategoryTitle'
}
</script>

<template>
  <div
    class="dialogProgramSettings__category"
    :data-test-locator="displayMode === 'tab' ? `dialogProgramSettings-category-${categoryKey}` : `dialogProgramSettings-search-category-${categoryKey}`"
  >
    <h5
      :class="[
        'dialogProgramSettings__categoryTitle',
        'text-bold',
        'q-my-none',
        'text-h6',
        displayMode === 'search' ? 'dialogProgramSettings__categoryTitle--searchOverlay' : ''
      ]"
      :data-test-locator="categoryTitleLocator(displayMode)"
    >
      {{ category.title }}
    </h5>

    <div
      v-for="(subCategory, subCategoryKey, subCategoryIndex) in category.subCategories"
      :key="subCategoryKey"
      class="dialogProgramSettings__subCategory"
      :data-test-locator="displayMode === 'tab' ? `dialogProgramSettings-subcategory-${categoryKey}-${subCategoryKey}` : `dialogProgramSettings-search-subcategory-${categoryKey}-${subCategoryKey}`"
    >
      <h6
        class="dialogProgramSettings__subCategoryTitle text-bold q-mb-none text-subtitle1 text-primary-bright"
        :data-test-locator="subCategoryTitleLocator(displayMode)"
      >
        {{ subCategory.title }}
      </h6>

      <div class="row q-col-gutter-md">
        <DialogProgramSettingsSettingBlock
          v-for="(setting, settingKey) in subCategory.settingsList"
          :key="settingKey"
          :display-mode="displayMode"
          :setting="setting"
          :setting-key="String(settingKey)"
          @update-setting="(k, v) => emit('update-setting', k, v)"
        />
      </div>

      <q-separator
        v-if="showNonLastSeparator(category.subCategories, subCategoryIndex)"
        horizontal
        class="q-mt-md"
        color="primary"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dialogProgramSettings__category {
  padding: $dialogProgramSettings-category-paddingTop $dialogProgramSettings-category-paddingX 0;
}

.dialogProgramSettings__categoryTitle {
  background: $dark;
  left: $dialogProgramSettings-categoryTitle-left;
  padding-bottom: $dialogProgramSettings-categoryTitle-paddingBottom;
  padding-top: $dialogProgramSettings-categoryTitle-paddingTop;
  position: absolute;
  right: $dialogProgramSettings-categoryTitle-right;
  top: 0;
  z-index: $dialogProgramSettings-categoryTitle-zIndex;
}

.dialogProgramSettings__categoryTitle--searchOverlay {
  left: auto;
  margin-bottom: $dialogProgramSettings-searchPanel-categoryTitle-marginBottom;
  margin-top: $dialogProgramSettings-searchPanel-categoryTitle-marginTop;
  position: static;
  right: auto;
}
</style>
