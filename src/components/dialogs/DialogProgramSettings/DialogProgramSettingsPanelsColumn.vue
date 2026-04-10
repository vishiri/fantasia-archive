<script setup lang="ts">
import type { T_programSettingsRenderTree } from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.types'
import DialogProgramSettingsCategoryPanel from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettingsCategoryPanel.vue'
import ErrorCard from 'src/components/elements/ErrorCard/ErrorCard.vue'
import { showNonLastTopCategorySeparator } from 'app/src/components/dialogs/DialogProgramSettings/scripts/programSettingsHelpers'

defineProps<{
  hasActiveSearchQuery: boolean
  hasSearchNoMatchingSettings: boolean
  programSettingsTree: T_programSettingsRenderTree
  searchFilteredProgramSettingsTree: T_programSettingsRenderTree
  selectedCategoryTab: string
}>()

const emit = defineEmits<{
  'update-setting': [key: string, value: boolean]
}>()
</script>

<template>
  <q-separator vertical />

  <div class="dialogProgramSettings__tabPanelsHost col q-pa-none">
    <q-tab-panels
      :model-value="selectedCategoryTab"
      animated
      vertical
      transition-prev="jump-up"
      transition-next="jump-down"
      class="dialogProgramSettings__tabPanelsRoot q-pa-none"
    >
      <q-tab-panel
        v-for="(category, categoryKey) in programSettingsTree"
        :key="categoryKey"
        :name="categoryKey"
        class="dialogProgramSettings__tabPanel q-pa-none"
      >
        <div class="dialogProgramSettings__panelScroll hasScrollbar">
          <div class="dialogProgramSettings__panelScrollInner q-py-sm">
            <DialogProgramSettingsCategoryPanel
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
        class="dialogProgramSettings__searchAllSettingsPanel q-tab-panel q-pa-none"
        data-test-locator="dialogProgramSettings-searchAllSettingsPanel"
      >
        <div class="dialogProgramSettings__panelScroll hasScrollbar">
          <div
            v-show="hasSearchNoMatchingSettings"
            class="dialogProgramSettings__searchEmpty flex flex-center"
            data-test-locator="dialogProgramSettings-searchNoResults"
          >
            <ErrorCard
              :title="$t('dialogs.programSettings.searchNoResultsTitle')"
              :description="$t('dialogs.programSettings.searchNoResultsDescription')"
              image-name="reading"
              :width="650"
            />
          </div>
          <div
            v-show="!hasSearchNoMatchingSettings"
            class="dialogProgramSettings__panelScrollInner q-py-sm"
          >
            <template
              v-for="(category, categoryKey, categoryIndex) in searchFilteredProgramSettingsTree"
              :key="categoryKey"
            >
              <DialogProgramSettingsCategoryPanel
                display-mode="search"
                :category="category"
                :category-key="String(categoryKey)"
                @update-setting="(k, v) => emit('update-setting', k, v)"
              />

              <q-separator
                v-if="showNonLastTopCategorySeparator(searchFilteredProgramSettingsTree, categoryIndex)"
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

<style lang="scss" scoped>
.dialogProgramSettings__tabPanelsHost {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  position: relative;
}

.dialogProgramSettings__searchAllSettingsPanel {
  background: $dark;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  inset: 0;
  max-height: 100%;
  min-height: 0;
  overflow: hidden;
  position: absolute;
  z-index: $dialogProgramSettings-searchPanel-zIndex;

  &::before {
    background: $dialogProgramSettings-gradientTop;
    content: '';
    height: $dialogProgramSettings-gradientBar-height;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 0;
  }

  &::after {
    background: $dialogProgramSettings-gradientBottom;
    bottom: 0;
    content: '';
    height: $dialogProgramSettings-gradientBar-height;
    left: 0;
    position: absolute;
    right: 0;
    z-index: 0;
  }
}

.dialogProgramSettings__tabPanelsRoot {
  background: transparent;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}

.dialogProgramSettings__tabPanel {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  max-height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: 0;
}

.dialogProgramSettings__panelScroll {
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  overflow: hidden auto;
}

.dialogProgramSettings__searchEmpty {
  box-sizing: border-box;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 100%;
  padding: $dialogProgramSettings-searchEmpty-padding;
  position: relative;
  z-index: 1;
}
</style>
