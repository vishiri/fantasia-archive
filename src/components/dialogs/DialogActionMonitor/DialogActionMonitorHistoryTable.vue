<template>
  <q-table
    dense
    flat
    dark
    hide-pagination
    hide-bottom
    row-key="uid"
    class="dialogActionMonitor__table hasScrollbar"
    :columns="columns"
    :rows="rows"
    :rows-per-page-options="[0]"
    :style="tableHeightStyle"
    data-test-locator="dialogActionMonitor-table"
    @row-click="onQTableRowClick"
  >
    <template #body-cell-action="cellProps">
      <q-td
        :props="cellProps"
        data-test-locator="dialogActionMonitor-cell-action"
      >
        <span>{{ cellProps.row.id }}</span>
      </q-td>
    </template>

    <template #body-cell-startTime="cellProps">
      <q-td
        :props="cellProps"
        data-test-locator="dialogActionMonitor-cell-startTime"
      >
        {{ formatDialogActionMonitorTimestamp(cellProps.row.startedAt) }}
      </q-td>
    </template>

    <template #body-cell-finishTime="cellProps">
      <q-td
        :props="cellProps"
        data-test-locator="dialogActionMonitor-cell-finishTime"
      >
        {{ formatDialogActionMonitorTimestamp(cellProps.row.finishedAt) }}
      </q-td>
    </template>

    <template #body-cell-payload="cellProps">
      <q-td
        :props="cellProps"
        data-test-locator="dialogActionMonitor-cell-payload"
      >
        <q-icon
          v-if="hasDialogActionMonitorPayload(cellProps.row)"
          class="text-positive"
          name="mdi-check"
          size="20px"
          :aria-label="$t('dialogs.actionMonitor.payloadPresentAria')"
        />
        <q-icon
          v-else
          class="fa-text-muted"
          name="mdi-minus"
          size="20px"
          role="img"
          :aria-label="$t('dialogs.actionMonitor.payloadEmptyAria')"
          data-test-locator="dialogActionMonitor-cell-payload-empty"
        />
      </q-td>
    </template>

    <template #body-cell-type="cellProps">
      <q-td
        :props="cellProps"
        data-test-locator="dialogActionMonitor-cell-type"
      >
        {{ formatDialogActionMonitorActionKind(cellProps.row.kind) }}
      </q-td>
    </template>

    <template #body-cell-status="cellProps">
      <q-td
        :props="cellProps"
        data-test-locator="dialogActionMonitor-cell-status"
      >
        <span
          v-for="badge in [buildDialogActionMonitorStatusBadge(cellProps.row.status)]"
          :key="`${cellProps.row.uid}-${badge.label}`"
          class="dialogActionMonitor__statusWithTooltip"
          :data-test-locator="`dialogActionMonitor-status-${cellProps.row.status}`"
        >
          <q-spinner-gears
            v-if="badge.isSpinner"
            :class="badge.colorClass"
            size="20px"
            aria-hidden="true"
          />
          <q-icon
            v-else-if="badge.icon !== ''"
            :class="badge.colorClass"
            :name="badge.icon"
            size="20px"
            aria-hidden="true"
          />
          <q-tooltip>{{ badge.label }}</q-tooltip>
          <span class="sr-only">{{ badge.label }}</span>
        </span>
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import type { I_faActionHistoryEntry } from 'app/types/I_faActionManagerDomain'

import type { I_dialogActionMonitorTableColumn } from 'app/src/components/dialogs/DialogActionMonitor/scripts/dialogActionMonitorTable'
import {
  buildDialogActionMonitorStatusBadge,
  formatDialogActionMonitorActionKind,
  formatDialogActionMonitorTimestamp,
  hasDialogActionMonitorPayload
} from 'app/src/components/dialogs/DialogActionMonitor/scripts/dialogActionMonitorTable'

defineProps<{
  columns: I_dialogActionMonitorTableColumn[]
  rows: I_faActionHistoryEntry[]
  tableHeightStyle: Record<string, string> | undefined
}>()

const emit = defineEmits<{
  rowClick: [event: Event, row: I_faActionHistoryEntry]
}>()

function onQTableRowClick (event: Event, row: I_faActionHistoryEntry): void {
  emit('rowClick', event, row)
}
</script>

<style scoped lang="scss">
.dialogActionMonitor__statusWithTooltip {
  align-items: center;
  display: inline-flex;
  justify-content: center;
  min-height: $dialogActionMonitor-status-icon-size;
  min-width: $dialogActionMonitor-status-icon-size;
}
</style>
