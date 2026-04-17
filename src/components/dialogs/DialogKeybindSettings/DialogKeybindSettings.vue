<template>
  <q-dialog
    v-model="dialogModel"
    :class="['dialogComponent', documentName]"
    aria-labelledby="dialogKeybindSettings-title"
    persistent
    @hide="onCloseMain"
  >
    <q-card :class="['dialogComponent__wrapper', documentName, 'dialogKeybindSettings__card']">
      <h4
        id="dialogKeybindSettings-title"
        class="text-center q-mb-sm"
        data-test-locator="dialogKeybindSettings-title"
      >
        {{ $t('dialogs.keybindSettings.title') }}
      </h4>

      <q-card-section
        ref="bodySectionRef"
        class="q-pt-none dialogKeybindSettings__body"
      >
        <q-table
          class="dialogKeybindSettings__table"
          :style="dialogKeybindSettingsTableHeightStyle"
          dark
          flat
          :virtual-scroll="tableRows.length > 0"
          :columns="tableColumns"
          :rows="tableRows"
          :rows-per-page-options="[0]"
          :title="$t('dialogs.keybindSettings.tableTitle')"
          :virtual-scroll-sticky-size-start="48"
          :hide-bottom="tableRows.length > 0"
          row-key="rowKey"
        >
          <template #top-right>
            <q-input
              v-model="filter"
              clearable
              dark
              debounce="300"
              dense
              :placeholder="$t('dialogs.keybindSettings.filterPlaceholder')"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>

          <template #body="bodySlot">
            <q-tr :props="bodySlot">
              <q-td
                key="name"
                :props="bodySlot"
              >
                {{ bodySlot.row.nameLabel }}
              </q-td>
              <q-td
                key="userKeybinds"
                :props="bodySlot"
              >
                <template v-if="bodySlot.row.editable">
                  <q-btn
                    :color="bodySlot.row.userShowsAddNewCombo ? 'primary-bright' : 'blue-grey-12'"
                    outline
                    size="11px"
                    data-test-locator="dialogKeybindSettings-userKeybind-button"
                    @click="onOpenCapture(bodySlot.row)"
                  >
                    {{ userKeybindButtonLabel(bodySlot.row) }}
                  </q-btn>
                </template>
                <template v-else>
                  <span class="text-secondary text-weight-bold">
                    {{ $t('dialogs.keybindSettings.builtInUneditable') }}
                  </span>
                </template>
              </q-td>
              <q-td
                key="defaultKeybinds"
                :props="bodySlot"
              >
                {{ bodySlot.row.defaultLabel }}
              </q-td>
            </q-tr>
          </template>

          <template #no-data>
            <div
              v-if="(filter ?? '').trim().length > 0"
              class="dialogKeybindSettings__filterEmpty flex flex-center"
              data-test-locator="dialogKeybindSettings-filterNoResults"
            >
              <ErrorCard
                :title="$t('dialogs.keybindSettings.filterNoResultsTitle')"
                :details="$t('dialogs.keybindSettings.filterNoResultsDescription')"
                image-name="reading"
                :width="650"
              />
            </div>
            <div
              v-else
              class="dialogKeybindSettings__tableEmpty text-secondary q-pa-md text-center"
              data-test-locator="dialogKeybindSettings-tableEmpty"
            >
              {{ $t('dialogs.keybindSettings.tableEmptyHint') }}
            </div>
          </template>
        </q-table>
      </q-card-section>

      <q-card-actions
        align="right"
        class="q-mb-md q-px-md"
      >
        <q-btn
          v-close-popup
          flat
          color="accent"
          class="q-mr-xl"
          :label="$t('dialogs.keybindSettings.closeWithoutSaving')"
        />
        <q-btn
          color="primary-bright"
          outline
          :label="$t('dialogs.keybindSettings.saveButton')"
          data-test-locator="dialogKeybindSettings-save"
          @click="saveMain"
        />
      </q-card-actions>

      <DialogKeybindSettingsCaptureDialog
        v-model="captureOpen"
        :action-name="captureActionName"
        :capture-error="captureError"
        :capture-error-message="captureErrorMessage"
        :capture-info-message="captureInfoMessage"
        :capture-label="captureLabel"
        :has-pending-chord="pendingChord !== null"
        @capture-clear="onCaptureClear"
        @capture-set="onCaptureSet"
      />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { I_dialogKeybindSettingsRow } from '../../../../types/I_dialogKeybindSettings'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import DialogKeybindSettingsCaptureDialog from 'app/src/components/dialogs/DialogKeybindSettings/DialogKeybindSettingsCaptureDialog.vue'
import ErrorCard from 'app/src/components/elements/ErrorCard/ErrorCard.vue'
import {
  registerDialogKeybindSettingsGlobalSuspend,
  setupDialogKeybindSettingsDialogRouting
} from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsDialogWiring'
import { useDialogKeybindSettingsTableChrome } from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsTableLayout'
import { formatDialogKeybindSettingsUserKeybindButtonLabel } from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsUserKeybindLabel'
import { registerComponentDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/dialogManagement'
import { useDialogKeybindSettings } from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsState'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import { i18n } from 'app/i18n/externalFileLoader'
import { ref } from 'vue'

const props = defineProps<{
  directInput?: T_dialogName
}>()

const {
  captureActionName,
  captureError,
  captureErrorMessage,
  captureInfoMessage,
  captureLabel,
  captureOpen,
  filter,
  initializeForOpen,
  onCaptureClear,
  onCaptureSet,
  onCloseMain,
  onOpenCapture,
  onSaveMain,
  pendingChord,
  tableColumns,
  tableRows
} = useDialogKeybindSettings()
const dialogModel = ref(false)
const documentName = ref<T_dialogName>('KeybindSettings')
const {
  bodySectionRef,
  dialogKeybindSettingsTableHeightStyle
} = useDialogKeybindSettingsTableChrome(dialogModel)

registerComponentDialogStackGuard(dialogModel)
const keybindsStore = S_FaKeybinds()

const {
  formatChord,
  saveMain
} = setupDialogKeybindSettingsDialogRouting({
  dialogModel,
  documentName,
  initializeForOpen,
  keybindsStore,
  onSaveMain,
  props
})

function userKeybindButtonLabel (row: I_dialogKeybindSettingsRow): string {
  return formatDialogKeybindSettingsUserKeybindButtonLabel(
    row,
    {
      formatChord,
      t: (key: string) => i18n.global.t(key)
    }
  )
}
registerDialogKeybindSettingsGlobalSuspend({
  captureOpen,
  dialogModel
})
</script>
<style lang="scss" scoped>
.dialogKeybindSettings__filterEmpty {
  box-sizing: border-box;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 100%;
  padding: 16px 24px 24px;
  width: 100%;
}
</style>

<style lang="scss">
.KeybindSettings.dialogComponent {
  .dialogComponent__wrapper.KeybindSettings.dialogKeybindSettings__card {
    display: flex;
    flex-direction: column;
    height: min(#{$dialogKeybindSettings-wrapper-maxHeightCap}, calc(100vh - #{$dialogKeybindSettings-wrapper-maxHeightViewportSubtract}));
    max-width: min(#{$dialogKeybindSettings-card-width}, calc(100vw - #{$dialogKeybindSettings-card-maxWidthViewportSubtract}));
    min-height: 0;
    width: min(#{$dialogKeybindSettings-card-width}, calc(100vw - #{$dialogKeybindSettings-card-maxWidthViewportSubtract}));

    .dialogKeybindSettings__body {
      flex: 1 1 0;
      min-height: 0;
      overflow: hidden;
    }
  }
}
</style>
