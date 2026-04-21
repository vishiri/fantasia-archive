import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { expect, test } from 'vitest'

import type { I_faActionHistoryEntry } from 'app/types/I_faActionManagerDomain'

import { buildDialogActionMonitorColumns } from '../scripts/dialogActionMonitorTable'
import DialogActionMonitorHistoryTable from '../DialogActionMonitorHistoryTable.vue'

const tableStub = defineComponent({
  name: 'QTable',
  inheritAttrs: true,
  props: {
    columns: {
      default: () => [],
      type: Array
    },
    rows: {
      default: () => [],
      type: Array
    }
  },
  template: '<div data-test-locator="dialogActionMonitor-table"><slot /></div>'
})

/**
 * DialogActionMonitorHistoryTable
 * Mounts with column metadata and exposes the dialog table locator.
 */
test('Test that DialogActionMonitorHistoryTable renders the monitor table shell', async () => {
  const columns = buildDialogActionMonitorColumns()
  const rows: I_faActionHistoryEntry[] = []
  const w = mount(DialogActionMonitorHistoryTable, {
    props: {
      columns,
      rows,
      tableHeightStyle: { maxHeight: '400px' }
    },
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        QIcon: { template: '<i />' },
        QSpinnerGears: { template: '<span />' },
        QTable: tableStub,
        QTd: { template: '<td><slot /></td>' },
        QTooltip: { template: '<span><slot /></span>' }
      }
    }
  })

  await nextTick()
  expect(w.find('[data-test-locator="dialogActionMonitor-table"]').exists()).toBe(true)
  w.unmount()
})
