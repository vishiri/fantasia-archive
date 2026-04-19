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
      <q-card-section :class="['dialogComponent__content', `${documentName}`, 'q-mt-xl', 'q-mb-lg', 'q-mr-lg', 'q-ml-xl', 'q-pt-none']">
        <h6 id="dialogActionMonitor-title">
          {{ $t('dialogs.actionMonitor.title') }}
        </h6>

        <p
          v-if="rows.length > 0"
          class="dialogActionMonitor__rowClickHint"
          data-test-locator="dialogActionMonitor-rowClickHint"
        >
          {{ $t('dialogs.actionMonitor.rowClickHint') }}
        </p>

        <q-table
          v-if="rows.length > 0"
          dense
          flat
          dark
          hide-pagination
          row-key="uid"
          class="dialogActionMonitor__table hasScrollbar"
          :columns="columns"
          :rows="rows"
          :rows-per-page-options="[0]"
          data-test-locator="dialogActionMonitor-table"
          @row-click="onRowClick"
        >
          <template #body-cell-action="cellProps">
            <q-td
              :props="cellProps"
              data-test-locator="dialogActionMonitor-cell-action"
            >
              <span>{{ cellProps.row.id }}</span>
              <q-tooltip
                anchor="top middle"
                self="bottom middle"
                :data-test-tooltip-text="buildDialogActionMonitorPayloadTooltip(cellProps.row)"
              >
                {{ buildDialogActionMonitorPayloadTooltip(cellProps.row) }}
              </q-tooltip>
            </q-td>
          </template>

          <template #body-cell-timestamp="cellProps">
            <q-td
              :props="cellProps"
              data-test-locator="dialogActionMonitor-cell-timestamp"
            >
              {{ formatDialogActionMonitorTimestamp(cellProps.row.enqueuedAt) }}
            </q-td>
          </template>

          <template #body-cell-status="cellProps">
            <q-td
              :props="cellProps"
              data-test-locator="dialogActionMonitor-cell-status"
            >
              <q-spinner-clock
                v-if="buildDialogActionMonitorStatusBadge(cellProps.row.status).isSpinner"
                :class="buildDialogActionMonitorStatusBadge(cellProps.row.status).colorClass"
                size="20px"
                :data-test-locator="`dialogActionMonitor-status-${cellProps.row.status}`"
              />
              <q-icon
                v-else-if="buildDialogActionMonitorStatusBadge(cellProps.row.status).icon !== ''"
                :class="buildDialogActionMonitorStatusBadge(cellProps.row.status).colorClass"
                :name="buildDialogActionMonitorStatusBadge(cellProps.row.status).icon"
                size="20px"
                :data-test-locator="`dialogActionMonitor-status-${cellProps.row.status}`"
              />
              <span class="sr-only">{{ buildDialogActionMonitorStatusBadge(cellProps.row.status).label }}</span>
            </q-td>
          </template>
        </q-table>

        <p
          v-else
          class="dialogActionMonitor__empty"
          data-test-locator="dialogActionMonitor-empty"
        >
          {{ $t('dialogs.actionMonitor.emptyState') }}
        </p>
      </q-card-section>

      <q-card-actions
        align="right"
        class="q-mb-lg q-px-md"
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

import { copyDialogActionMonitorRowToClipboard } from 'app/src/components/dialogs/DialogActionMonitor/scripts/dialogActionMonitorRowClipboard'
import {
  buildDialogActionMonitorColumns,
  buildDialogActionMonitorPayloadTooltip,
  buildDialogActionMonitorStatusBadge,
  formatDialogActionMonitorTimestamp
} from 'app/src/components/dialogs/DialogActionMonitor/scripts/dialogActionMonitorTable'

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
    max-width: $dialogActionMonitor-wrapper-maxWidth;
    width: $dialogActionMonitor-wrapper-width;
  }

  .dialogComponent__content {
    max-height: calc(100vh - #{$dialogActionMonitor-content-maxHeightSubtract});
    overflow: auto;
  }

  .dialogActionMonitor__table {
    margin-top: $dialogActionMonitor-table-marginTop;
    width: 100%;

    tbody tr {
      cursor: $dialogActionMonitor-row-cursor;
    }
  }

  .dialogActionMonitor__rowClickHint {
    color: $dialogActionMonitor-rowClickHint-color;
    font-size: $dialogActionMonitor-rowClickHint-fontSize;
    margin: $dialogActionMonitor-rowClickHint-marginTop 0 0;
    text-align: right;
  }

  .dialogActionMonitor__empty {
    color: $dialogActionMonitor-empty-color;
    margin-top: $dialogActionMonitor-empty-marginTop;
    text-align: center;
  }
}
</style>
