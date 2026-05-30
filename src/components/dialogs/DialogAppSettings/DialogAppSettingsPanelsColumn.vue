<template>
  <q-separator vertical />

  <div class="dialogAppSettings__tabPanelsHost col q-pa-none">
    <q-tab-panels
      :model-value="selectedCategoryTab"
      animated
      vertical
      transition-prev="jump-up"
      transition-next="jump-down"
      class="dialogAppSettings__tabPanelsRoot q-pa-none"
    >
      <q-tab-panel
        v-for="(category, categoryKey) in appSettingsTree"
        :key="categoryKey"
        :name="categoryKey"
        class="dialogAppSettings__tabPanel q-pa-none"
      >
        <div class="dialogAppSettings__panelScroll hasScrollbar">
          <div class="dialogAppSettings__panelScrollInner q-py-sm">
            <DialogAppSettingsCategoryPanel
              display-mode="tab"
              :category="category"
              :category-key="String(categoryKey)"
              @update-setting="(k, v) => emit('update-setting', k, v)"
            />
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <Transition
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div
        v-if="hasActiveSearchQuery"
        class="dialogAppSettings__searchAllSettingsPanel q-tab-panel q-pa-none"
        data-test-locator="dialogAppSettings-searchAllSettingsPanel"
      >
        <div class="dialogAppSettings__panelScroll hasScrollbar">
          <div
            v-show="hasSearchNoMatchingSettings"
            class="dialogAppSettings__searchEmpty flex flex-center"
            data-test-locator="dialogAppSettings-searchNoResults"
          >
            <ErrorCard
              :title="$t('dialogs.appSettings.searchNoResultsTitle')"
              :details="$t('dialogs.appSettings.searchNoResultsDescription')"
              image-name="reading"
              :width="650"
            />
          </div>
          <div
            v-show="!hasSearchNoMatchingSettings"
            class="dialogAppSettings__panelScrollInner q-py-sm"
          >
            <template
              v-for="(category, categoryKey, categoryIndex) in searchFilteredAppSettingsTree"
              :key="categoryKey"
            >
              <DialogAppSettingsCategoryPanel
                display-mode="search"
                :category="category"
                :category-key="String(categoryKey)"
                @update-setting="(k, v) => emit('update-setting', k, v)"
              />

              <q-separator
                v-if="showNonLastTopCategorySeparator(searchFilteredAppSettingsTree, categoryIndex)"
                horizontal
                class="q-my-lg"
                color="primary"
              />
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { T_appSettingsRenderTree } from 'app/types/I_dialogAppSettings'
import DialogAppSettingsCategoryPanel from 'app/src/components/dialogs/DialogAppSettings/DialogAppSettingsCategoryPanel.vue'
import ErrorCard from 'src/components/elements/ErrorCard/ErrorCard.vue'
import { showNonLastTopCategorySeparator } from 'app/src/components/dialogs/DialogAppSettings/scripts/functions/dialogAppSettingsSearch'

defineProps<{
  hasActiveSearchQuery: boolean
  hasSearchNoMatchingSettings: boolean
  appSettingsTree: T_appSettingsRenderTree
  searchFilteredAppSettingsTree: T_appSettingsRenderTree
  selectedCategoryTab: string
}>()

const emit = defineEmits<{
  'update-setting': [key: string, value: boolean]
}>()
</script>

<style lang="scss" scoped>
.dialogAppSettings__tabPanelsHost {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  position: relative;
}

.dialogAppSettings__searchAllSettingsPanel {
  background: $dialogAppSettings-surface-backgroundColor;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  inset: 0;
  max-height: 100%;
  min-height: 0;
  overflow: hidden;
  position: absolute;
  z-index: $dialogAppSettings-searchPanel-zIndex;

  &::before {
    background: $dialogAppSettings-gradientTop;
    content: '';
    height: $dialogAppSettings-gradientBar-height;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 0;
  }

  &::after {
    background: $dialogAppSettings-gradientBottom;
    bottom: 0;
    content: '';
    height: $dialogAppSettings-gradientBar-height;
    left: 0;
    position: absolute;
    right: 0;
    z-index: 0;
  }
}

.dialogAppSettings__tabPanelsRoot {
  background: transparent;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}

.dialogAppSettings__tabPanel {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  max-height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: 0;
}

.dialogAppSettings__panelScroll {
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  overflow: hidden auto;
}

.dialogAppSettings__searchEmpty {
  box-sizing: border-box;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 100%;
  padding: $dialogAppSettings-searchEmpty-padding;
  position: relative;
  z-index: 1;
}
</style>
