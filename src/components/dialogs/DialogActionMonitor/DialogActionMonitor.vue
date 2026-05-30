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
      <h5
        id="dialogActionMonitor-title"
        class="text-center text-h5 q-mb-sm"
        data-test-locator="dialogActionMonitor-title"
      >
        {{ $t('dialogs.actionMonitor.title') }}
      </h5>

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
import type { I_faActionHistoryEntry } from 'app/types/I_faActionManagerDomain'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

import DialogActionMonitorHistoryTable from './DialogActionMonitorHistoryTable.vue'
import { useDialogActionMonitor } from './scripts/dialogActionMonitor_manager'

const props = defineProps<{
  /**
   * Component-test / Storybook hook that opens the dialog without going through the Pinia dialog store.
   */
  directInput?: T_dialogName
  /**
   * Optional pre-built snapshot; when present the table renders these rows instead of calling 'snapshotActionHistory'.
   */
  directHistorySnapshot?: I_faActionHistoryEntry[]
}>()

const {
  columns,
  dialogActionMonitorTableHeightStyle,
  dialogModel,
  documentName,
  onDialogShow,
  onRowClick,
  rows,
  tableScrollHostRef
} = useDialogActionMonitor(props)
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
