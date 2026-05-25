import type { Meta, StoryObj } from '@storybook/vue3-vite'

import type { I_faActionHistoryEntry } from 'app/types/I_faActionManagerDomain'

import { buildDialogActionMonitorColumns } from '../scripts/dialogActionMonitorTable'
import DialogActionMonitorHistoryTable from '../DialogActionMonitorHistoryTable.vue'

const sampleHistory: I_faActionHistoryEntry[] = [
  {
    enqueuedAt: Date.now() - 5_000,
    finishedAt: Date.now() - 4_000,
    id: 'toggleDeveloperTools',
    kind: 'async',
    startedAt: Date.now() - 4_500,
    status: 'success',
    uid: 'storybook-history-table-1'
  },
  {
    enqueuedAt: Date.now() - 2_000,
    id: 'closeApp',
    kind: 'sync',
    status: 'queued',
    uid: 'storybook-history-table-2'
  }
]

const meta = {
  component: DialogActionMonitorHistoryTable,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogActionMonitorHistoryTable'
} satisfies Meta<typeof DialogActionMonitorHistoryTable>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    columns: buildDialogActionMonitorColumns(),
    rows: sampleHistory,
    tableHeightStyle: {
      maxHeight: '320px'
    }
  }
}
