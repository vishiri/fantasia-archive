<template>
  <q-dialog
    v-model="dialogModel"
    persistent
    :class="[
      'dialogComponent',
      `${documentName}`,
      hasActiveSearchQuery ? 'hasActiveSearchQuery' : ''
    ]"
    aria-labelledby="dialogAppSettings-title"
  >
    <q-card
      :class="['dialogComponent__wrapper', 'dialogAppSettings', `${documentName}`]"
    >
      <!-- Scrim must be a direct child of .dialogComponent__wrapper (position: relative) so inset:0 covers the full card; nesting under .dialogAppSettings__body does not. -->
      <Transition
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
        :duration="200"
      >
        <div
          v-if="hasActiveSearchQuery"
          class="dialogAppSettings__tabsSearchOverlay"
          data-test-locator="dialogAppSettings-tabsSearchOverlay"
        />
      </Transition>

      <!-- Title: fixed, does not scroll with tab content -->
      <h5
        id="dialogAppSettings-title"
        class="dialogAppSettings__title text-center text-h5"
        data-test-locator="dialogAppSettings-title"
      >
        {{ $t('dialogs.appSettings.title') }}
      </h5>

      <q-card-section class="dialogAppSettings__body row no-wrap q-pa-none">
        <DialogAppSettingsLeftColumn
          v-model:search-settings-query="searchSettingsQuery"
          v-model:selected-category-tab="selectedCategoryTab"
          :has-active-search-query="hasActiveSearchQuery"
          :app-settings-tree="appSettingsTree"
        />

        <DialogAppSettingsPanelsColumn
          :has-active-search-query="hasActiveSearchQuery"
          :has-search-no-matching-settings="hasSearchNoMatchingSettings"
          :app-settings-tree="appSettingsTree"
          :search-filtered-app-settings-tree="searchFilteredAppSettingsTree"
          :selected-category-tab="selectedCategoryTab"
          @update-setting="updateLocalSetting"
        />
      </q-card-section>

      <!-- Card actions wrapper -->
      <q-card-actions
        align="right"
        class="q-mb-lg q-px-md q-gutter-sm dialogAppSettings__cardActions"
      >
        <q-btn
          v-close-popup
          flat
          :label="$t('dialogs.appSettings.closeButton')"
          class="q-mr-xl"
          color="accent"
          data-test-locator="dialogAppSettings-button-close"
        />

        <q-btn
          outline
          :label="$t('dialogs.appSettings.saveButton')"
          color="primary-bright"
          data-test-locator="dialogAppSettings-button-save"
          @click="saveAndCloseDialog"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import DialogAppSettingsLeftColumn from 'app/src/components/dialogs/DialogAppSettings/DialogAppSettingsLeftColumn.vue'
import DialogAppSettingsPanelsColumn from 'app/src/components/dialogs/DialogAppSettings/DialogAppSettingsPanelsColumn.vue'
import { useDialogAppSettings } from 'app/src/components/dialogs/DialogAppSettings/scripts/dialogAppSettings_manager'

const props = defineProps<{
  /**
   * Custom input directly fed to the component in case it doesn't get triggered from the global store
   */
  directInput?: T_dialogName | undefined
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
  appSettingsTree,
  saveAndCloseDialog,
  searchFilteredAppSettingsTree,
  searchSettingsQuery,
  selectedCategoryTab,
  updateLocalSetting
} = useDialogAppSettings(props)
</script>

<style lang="scss">
.AppSettings {
  &.dialogComponent__wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: calc(100vw - #{$dialogAppSettings-card-maxWidthViewportSubtract});
    overflow: hidden;
    position: relative;
    width: $dialogAppSettings-card-width;
  }

  .dialogAppSettings__title {
    z-index: $dialogAppSettings-title-zIndex;
  }

  .dialogAppSettings__body {
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
  }

  .dialogAppSettings__tabsSearchOverlay {
    background: $dialogAppSettings-scrimDark;
    inset: 0;
    pointer-events: none;
    position: absolute;
    z-index: $dialogAppSettings-tabsSearchOverlay-zIndex;
  }

  .q-tabs--vertical .q-tab {
    padding: 0 $dialogAppSettings-verticalTab-paddingX;
  }

  &.hasActiveSearchQuery {
    .dialogAppSettings__settingsSearchWrapper {
      &::after {
        background: $dialogAppSettings-gradientTop;
        content: "";
        opacity: 1;
      }

      &::before {
        background-color: $dialogAppSettings-surface-backgroundColor;
        content: "";
        opacity: 1;
      }
    }
  }

  .dialogAppSettings__cardActions {
    z-index: $dialogAppSettings-searchPanel-zIndex;
  }
}
</style>
