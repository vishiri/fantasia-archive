<template>
  <div
    class="dialogAppSettings__category"
    :class="{ 'dialogAppSettings__category--bodyOnly': !showsCategoryTitle }"
    :data-test-locator="displayMode === 'tab' ? `dialogAppSettings-category-${categoryKey}` : `dialogAppSettings-search-category-${categoryKey}`"
  >
    <h5
      v-if="showsCategoryTitle"
      :class="[
        'dialogAppSettings__categoryTitle',
        'text-bold',
        'q-my-none',
        'text-h6',
        displayMode === 'search' ? 'dialogAppSettings__categoryTitle--search' : ''
      ]"
      :data-test-locator="categoryTitleLocator(displayMode)"
    >
      {{ category.title }}
    </h5>

    <div
      v-for="(subCategory, subCategoryKey, subCategoryIndex) in category.subCategories"
      :key="subCategoryKey"
      class="dialogAppSettings__subCategory"
      :data-test-locator="displayMode === 'tab' ? `dialogAppSettings-subcategory-${categoryKey}-${subCategoryKey}` : `dialogAppSettings-search-subcategory-${categoryKey}-${subCategoryKey}`"
    >
      <h6
        class="dialogAppSettings__subCategoryTitle text-bold q-mb-none text-subtitle1 text-primary-bright"
        :data-test-locator="subCategoryTitleLocator(displayMode)"
      >
        {{ subCategory.title }}
      </h6>

      <div class="row q-col-gutter-md">
        <DialogAppSettingsSettingBlock
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
        class="q-mt-md fa-painted-divider--horizontal"
        color="primary"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  I_appSettingsCategoryRenderItem,
  T_appSettingsSettingUpdateValue
} from 'app/types/I_dialogAppSettings'
import DialogAppSettingsSettingBlock from 'app/src/components/dialogs/DialogAppSettings/DialogAppSettingsSettingBlock.vue'
import { showNonLastSeparator } from 'app/src/components/dialogs/DialogAppSettings/scripts/functions/dialogAppSettingsSearch'

withDefaults(
  defineProps<{
    category: I_appSettingsCategoryRenderItem
    categoryKey: string
    displayMode: 'tab' | 'search'
    showsCategoryTitle?: boolean
  }>(),
  {
    showsCategoryTitle: true
  }
)

const emit = defineEmits<{
  'update-setting': [key: string, value: T_appSettingsSettingUpdateValue]
}>()

function categoryTitleLocator (mode: 'tab' | 'search'): string {
  return mode === 'tab' ? 'dialogAppSettings-categoryTitle' : 'dialogAppSettings-search-categoryTitle'
}

function subCategoryTitleLocator (mode: 'tab' | 'search'): string {
  return mode === 'tab' ? 'dialogAppSettings-subcategoryTitle' : 'dialogAppSettings-search-subcategoryTitle'
}
</script>

<style lang="scss" scoped>
.dialogAppSettings__category {
  padding: $dialogAppSettings-category-paddingTop $dialogAppSettings-category-paddingX 0;
}

.dialogAppSettings__category--bodyOnly {
  padding-top: 0;
}

.dialogAppSettings__categoryTitle {
  margin-bottom: $dialogAppSettings-categoryTitle-paddingBottom;
  padding-bottom: $dialogAppSettings-categoryTitle-paddingBottom;
  padding-top: $dialogAppSettings-categoryTitle-paddingTop;
}

.dialogAppSettings__categoryTitle--search {
  margin-bottom: $dialogAppSettings-categoryTitle-paddingBottom;
}
</style>
