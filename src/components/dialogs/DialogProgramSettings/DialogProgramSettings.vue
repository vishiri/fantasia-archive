<template>
  <!-- Dialog wrapper: persistent blocks backdrop and Escape from closing; only actions dismiss. -->
  <q-dialog
    v-model="dialogModel"
    persistent
    :class="[
      'dialogComponent',
      `${documentName}`,
      hasActiveSearchQuery ? 'hasActiveSearchQuery' : ''
    ]"
    aria-labelledby="dialogProgramSettings-title"
  >
    <q-card
      :class="['dialogComponent__wrapper', 'dialogProgramSettings', `${documentName}`]"
    >
      <!-- Scrim must be a direct child of .dialogComponent__wrapper (position: relative) so inset:0 covers the full card; nesting under .dialogProgramSettings__body does not. -->
      <Transition
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
        :duration="200"
      >
        <div
          v-if="hasActiveSearchQuery"
          class="dialogProgramSettings__tabsSearchOverlay"
          data-test-locator="dialogProgramSettings-tabsSearchOverlay"
        />
      </Transition>

      <!-- Title: fixed, does not scroll with tab content -->
      <h4
        id="dialogProgramSettings-title"
        class="dialogProgramSettings__title text-center"
        data-test-locator="dialogProgramSettings-title"
      >
        {{ $t('dialogs.programSettings.title') }}
      </h4>

      <q-card-section class="dialogProgramSettings__body row no-wrap q-pa-none">
        <DialogProgramSettingsLeftColumn
          v-model:search-settings-query="searchSettingsQuery"
          v-model:selected-category-tab="selectedCategoryTab"
          :has-active-search-query="hasActiveSearchQuery"
          :program-settings-tree="programSettingsTree"
        />

        <DialogProgramSettingsPanelsColumn
          :has-active-search-query="hasActiveSearchQuery"
          :has-search-no-matching-settings="hasSearchNoMatchingSettings"
          :program-settings-tree="programSettingsTree"
          :search-filtered-program-settings-tree="searchFilteredProgramSettingsTree"
          :selected-category-tab="selectedCategoryTab"
          @update-setting="updateLocalSetting"
        />
      </q-card-section>

      <!-- Card actions wrapper -->
      <q-card-actions
        align="right"
        class="q-mb-lg q-px-md q-gutter-sm dialogProgramSettings__cardActions"
      >
        <q-btn
          v-close-popup
          flat
          :label="$t('dialogs.programSettings.closeButton')"
          class="q-mr-xl"
          color="accent"
          data-test-locator="dialogProgramSettings-button-close"
        />

        <q-btn
          outline
          :label="$t('dialogs.programSettings.saveButton')"
          color="primary-bright"
          data-test-locator="dialogProgramSettings-button-save"
          @click="saveAndCloseDialog"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { I_faUserSettings } from 'app/types/I_faUserSettings'
import type { T_dialogName } from 'app/types/T_dialogList'
import DialogProgramSettingsLeftColumn from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettingsLeftColumn.vue'
import DialogProgramSettingsPanelsColumn from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettingsPanelsColumn.vue'
import { useDialogProgramSettings } from 'app/src/components/dialogs/DialogProgramSettings/scripts/useDialogProgramSettings'

const props = defineProps<{
  /**
   * Custom input directly fed to the component in case it doesn't get triggered from the global store
   */
  directInput?: T_dialogName
  /**
   * When set (for example in Storybook), builds the toggle tree from this snapshot instead of calling the user-settings bridge.
   */
  directSettingsSnapshot?: I_faUserSettings
}>()

const {
  dialogModel,
  documentName,
  hasActiveSearchQuery,
  hasSearchNoMatchingSettings,
  programSettingsTree,
  saveAndCloseDialog,
  searchFilteredProgramSettingsTree,
  searchSettingsQuery,
  selectedCategoryTab,
  updateLocalSetting
} = useDialogProgramSettings(props)
</script>

<style lang="scss">
.ProgramSettings {
  &.dialogComponent__wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: calc(100vh - #{$dialogProgramSettings-card-maxHeightSubtract});
    max-width: calc(100vw - #{$dialogProgramSettings-card-maxWidthViewportSubtract});
    overflow: hidden;
    position: relative;
    width: $dialogProgramSettings-card-width;
  }

  .dialogProgramSettings__title {
    z-index: $dialogProgramSettings-title-zIndex;
  }

  .dialogProgramSettings__body {
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
  }

  .dialogProgramSettings__tabsSearchOverlay {
    background: $dialogProgramSettings-scrimDark;
    inset: 0;
    pointer-events: none;
    position: absolute;
    z-index: $dialogProgramSettings-tabsSearchOverlay-zIndex;
  }

  .q-tabs--vertical .q-tab {
    padding: 0 $dialogProgramSettings-verticalTab-paddingX;
  }

  &.hasActiveSearchQuery {
    .dialogProgramSettings__settingsSearchWrapper {
      &::after {
        background: $dialogProgramSettings-gradientTop;
        content: "";
        opacity: 1;
      }

      &::before {
        background-color: $dark;
        content: "";
        opacity: 1;
      }
    }
  }

  .dialogProgramSettings__cardActions {
    z-index: $dialogProgramSettings-searchPanel-zIndex;
  }
}
</style>
