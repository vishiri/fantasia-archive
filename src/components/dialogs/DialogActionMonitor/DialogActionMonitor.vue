<template>
  <!-- Dialog wrapper: action monitor reads a snapshot once per show; rows do not stream live. -->
  <q-dialog
    v-model="dialogModel"
    :class="['dialogComponent', `${documentName}`]"
    aria-labelledby="dialogActionMonitor-title"
    @show="onDialogShow"
  >
    <q-card
      :class="['dialogComponent__wrapper', 'dialogActionMonitor', `${documentName}`]"
    >
      <h4
        id="dialogActionMonitor-title"
        class="text-center q-mb-sm"
        data-test-locator="dialogActionMonitor-title"
      >
        {{ $t('dialogs.actionMonitor.title') }}
      </h4>

      <q-card-section
        :class="['dialogComponent__content', 'dialogActionMonitor__body', `${documentName}`, 'q-mb-lg', 'q-mr-lg', 'q-ml-xl', 'q-pt-none']"
      >
        <template v-if="rows.length > 0">
          <div
            class="dialogActionMonitor__rowClickHelpRow row justify-end items-center no-wrap"
          >
            <q-icon
              name="mdi-help-circle"
              size="23px"
              class="dialogActionMonitor__rowClickHelpIcon"
              role="img"
              color="primary-bright"
              :aria-label="$t('dialogs.actionMonitor.rowClickHint')"
              data-test-locator="dialogActionMonitor-rowClickHint"
            >
              <q-tooltip
                anchor="center left"
                self="center right"
                :delay="500"
              >
                {{ $t('dialogs.actionMonitor.rowClickHint') }}
              </q-tooltip>
            </q-icon>
          </div>

          <div
            ref="tableScrollHostRef"
            class="dialogActionMonitor__tableHost"
          >
            <DialogActionMonitorHistoryTable
              :columns="columns"
              :rows="rows"
              :table-height-style="dialogActionMonitorTableHeightStyle"
              @row-click="onRowClick"
            />
          </div>
        </template>

        <p
          v-else
          class="dialogActionMonitor__empty"
          data-test-locator="dialogActionMonitor-empty"
        >
          {{ $t('dialogs.actionMonitor.emptyState') }}
        </p>
      </q-card-section>

      <q-card-actions
        align="around"
        class="q-mb-lg"
      >
        <q-btn
          v-close-popup
          flat
          :label="$t('dialogs.actionMonitor.closeButton')"
          color="accent"
          data-test-locator="dialogComponent-button-close"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { StoreGeneric } from 'pinia'
import { onMounted, ref, watch } from 'vue'

import type { I_faActionHistoryEntry } from 'app/types/I_faActionManagerDomain'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { S_DialogComponent } from 'src/stores/S_Dialog'
import { registerComponentDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/dialogManagement'
import { snapshotActionHistory } from 'app/src/scripts/actionManager/faActionManagerHistory'

import DialogActionMonitorHistoryTable from 'app/src/components/dialogs/DialogActionMonitor/DialogActionMonitorHistoryTable.vue'
import { copyDialogActionMonitorRowToClipboard } from 'app/src/components/dialogs/DialogActionMonitor/scripts/dialogActionMonitorRowClipboard'
import { buildDialogActionMonitorColumns } from 'app/src/components/dialogs/DialogActionMonitor/scripts/dialogActionMonitorTable'
import { useDialogActionMonitorTableLayout } from 'app/src/components/dialogs/DialogActionMonitor/scripts/useDialogActionMonitorTableLayout'

const resolveDialogComponentStore = (): StoreGeneric | null => {
  try {
    return S_DialogComponent()
  } catch {
    return null
  }
}

const props = defineProps<{
  /**
   * Component-test / Storybook hook that opens the dialog without going through the Pinia dialog store.
   */
  directInput?: T_dialogName
  /**
   * Optional pre-built snapshot; when present the table renders these rows instead of calling 'snapshotActionHistory'.
   * Used by Storybook stories and Vitest specs that want deterministic content.
   */
  directHistorySnapshot?: I_faActionHistoryEntry[]
}>()

const dialogModel = ref(false)
registerComponentDialogStackGuard(dialogModel)

const {
  dialogActionMonitorTableHeightStyle,
  tableScrollHostRef
} = useDialogActionMonitorTableLayout(dialogModel)

const documentName = ref('')
const columns = buildDialogActionMonitorColumns()
const rows = ref<I_faActionHistoryEntry[]>([])

function refreshRows (): void {
  if (props.directHistorySnapshot !== undefined) {
    rows.value = props.directHistorySnapshot.map((entry) => {
      return { ...entry }
    })
    return
  }
  rows.value = snapshotActionHistory()
}

const openDialog = (input: T_dialogName): void => {
  documentName.value = input
  refreshRows()
  dialogModel.value = true
}

function onDialogShow (): void {
  refreshRows()
}

function onRowClick (_event: Event, row: I_faActionHistoryEntry): void {
  void copyDialogActionMonitorRowToClipboard(row)
}

watch(() => resolveDialogComponentStore()?.dialogUUID, () => {
  const componentDialogStore = resolveDialogComponentStore()
  if (componentDialogStore?.dialogToOpen === 'ActionMonitor') {
    openDialog(componentDialogStore.dialogToOpen as T_dialogName)
  }
})

watch(() => props.directInput, () => {
  if (props.directInput === 'ActionMonitor') {
    openDialog(props.directInput)
  }
})

onMounted(() => {
  if (props.directInput === 'ActionMonitor') {
    openDialog(props.directInput)
  }
})
</script>

<style lang="scss">
.ActionMonitor {
  &.dialogComponent__wrapper {
    display: flex;
    flex-direction: column;
    height: min(#{$dialogActionMonitor-wrapper-maxHeightCap}, calc(100vh - #{$dialogActionMonitor-wrapper-maxHeightViewportSubtract}));
    max-width: $dialogActionMonitor-wrapper-maxWidth;
    min-height: 0;
    width: $dialogActionMonitor-wrapper-width;
  }

  .dialogActionMonitor__body {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .dialogActionMonitor__tableHost {
    flex: 1 1 0;
    min-height: 0;
    min-width: 0;
  }

  .dialogActionMonitor__table {
    margin-top: $dialogActionMonitor-table-marginTop;
    width: 100%;

    tbody tr {
      cursor: $dialogActionMonitor-row-cursor;
    }
  }

  .dialogActionMonitor__rowClickHelpRow {
    margin: $dialogActionMonitor-rowClickHelpRow-marginTop 0 0;
  }

  .dialogActionMonitor__rowClickHelpIcon {
    color: $dialogActionMonitor-rowClickHelpIcon-color;
  }

  .dialogActionMonitor__empty {
    color: $dialogActionMonitor-empty-color;
    margin-top: $dialogActionMonitor-empty-marginTop;
    text-align: center;
  }
}
</style>
