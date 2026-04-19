import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import type { I_faActionHistoryEntry } from 'app/types/I_faActionManagerDomain'

import * as dialogStores from 'app/src/stores/S_Dialog'
import { S_DialogComponent } from 'app/src/stores/S_Dialog'

import * as rowClipboardModule from '../scripts/dialogActionMonitorRowClipboard'

import DialogActionMonitor from '../DialogActionMonitor.vue'

const monitorQDialogStub = defineComponent({
  name: 'QDialog',
  inheritAttrs: false,
  props: {
    modelValue: {
      default: false,
      type: Boolean
    }
  },
  emits: ['update:modelValue', 'show'],
  template: `
    <div class="action-monitor-qdialog-stub" v-bind="$attrs">
      <div v-if="modelValue" class="action-monitor-qdialog-inner">
        <slot />
      </div>
    </div>
  `
})

const monitorDialogGlobal = {
  mocks: { $t: (key: string) => key },
  stubs: {
    QBtn: { template: '<button type="button"><slot /></button>' },
    QCard: { template: '<div><slot /></div>' },
    QCardActions: { template: '<div><slot /></div>' },
    QCardSection: { template: '<div><slot /></div>' },
    QDialog: monitorQDialogStub,
    QIcon: { template: '<i><slot /></i>' },
    QSpinnerClock: { template: '<span data-test-locator="stub-spinner-clock" />' },
    QTable: {
      props: ['rows', 'columns'],
      emits: ['row-click'],
      template: `
        <div data-test-locator="stub-q-table">
          <div
            v-for="row in rows"
            :key="row.uid"
            data-test-locator="stub-q-table-row"
            @click="$emit('row-click', $event, row)"
          >
            <slot name="body-cell-action" :row="row" />
            <slot name="body-cell-timestamp" :row="row" />
            <slot name="body-cell-status" :row="row" />
          </div>
        </div>
      `
    },
    QTd: { template: '<div><slot /></div>' },
    QTooltip: { template: '<span data-test-locator="stub-tooltip"><slot /></span>' }
  }
} as const

const buildSampleHistory = (): I_faActionHistoryEntry[] => [
  {
    enqueuedAt: 1_700_000_000_000,
    finishedAt: 1_700_000_001_000,
    id: 'toggleDeveloperTools',
    kind: 'async',
    startedAt: 1_700_000_000_500,
    status: 'success',
    uid: 'uid-success'
  },
  {
    enqueuedAt: 1_700_000_002_000,
    errorMessage: 'Failed to save keybind settings.',
    finishedAt: 1_700_000_003_000,
    id: 'saveKeybindSettings',
    kind: 'async',
    payloadPreview: '{"overrides":{}}',
    startedAt: 1_700_000_002_500,
    status: 'failed',
    uid: 'uid-failed'
  },
  {
    enqueuedAt: 1_700_000_004_000,
    id: 'closeApp',
    kind: 'sync',
    status: 'queued',
    uid: 'uid-queued'
  },
  {
    enqueuedAt: 1_700_000_005_000,
    id: 'refreshWebContentsAfterLanguage',
    kind: 'sync',
    startedAt: 1_700_000_005_500,
    status: 'running',
    uid: 'uid-running'
  }
]

beforeEach(() => {
  vi.restoreAllMocks()
})

/**
 * DialogActionMonitor
 * directInput should open the dialog with the supplied snapshot rows visible.
 */
test('Test that DialogActionMonitor renders supplied snapshot rows when opened via directInput', async () => {
  const w = mount(DialogActionMonitor, {
    global: monitorDialogGlobal,
    props: {
      directHistorySnapshot: buildSampleHistory(),
      directInput: 'ActionMonitor'
    }
  })

  await flushPromises()

  const html = w.html()
  expect(html).toContain('dialogComponent')
  expect(html).toContain('ActionMonitor')
  expect(html).toContain('toggleDeveloperTools')
  expect(html).toContain('saveKeybindSettings')
  expect(html).toContain('closeApp')
  expect(html).toContain('refreshWebContentsAfterLanguage')
  expect(html).toContain('dialogActionMonitor-status-running')
  w.unmount()
})

/**
 * DialogActionMonitor
 * Empty snapshot should render the localized empty-state message.
 */
test('Test that DialogActionMonitor shows empty-state when snapshot is empty', async () => {
  const w = mount(DialogActionMonitor, {
    global: monitorDialogGlobal,
    props: {
      directHistorySnapshot: [],
      directInput: 'ActionMonitor'
    }
  })

  await flushPromises()

  expect(w.text()).toContain('dialogs.actionMonitor.emptyState')
  w.unmount()
})

/**
 * DialogActionMonitor
 * S_DialogComponent UUID change with dialogToOpen=ActionMonitor should open the dialog.
 */
test('Test that DialogActionMonitor opens from S_DialogComponent UUID watch for ActionMonitor', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = S_DialogComponent()

  const w = mount(DialogActionMonitor, {
    global: {
      ...monitorDialogGlobal,
      plugins: [pinia]
    },
    props: {
      directHistorySnapshot: buildSampleHistory()
    }
  })

  await flushPromises()

  store.dialogToOpen = 'ActionMonitor'
  store.generateDialogUUID()
  await flushPromises()

  expect(w.find('.action-monitor-qdialog-inner').exists()).toBe(true)
  w.unmount()
})

/**
 * DialogActionMonitor
 * Store UUID watch should ignore dialogToOpen values other than ActionMonitor.
 */
test('Test that DialogActionMonitor store watch skips non-monitor dialogToOpen values', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = S_DialogComponent()

  const w = mount(DialogActionMonitor, {
    global: {
      ...monitorDialogGlobal,
      plugins: [pinia]
    }
  })

  await flushPromises()

  store.dialogToOpen = 'AboutFantasiaArchive'
  store.generateDialogUUID()
  await flushPromises()

  expect(w.find('.action-monitor-qdialog-inner').exists()).toBe(false)
  w.unmount()
})

/**
 * DialogActionMonitor
 * directInput watch should react to props mutated after mount.
 */
test('Test that DialogActionMonitor opens when directInput becomes ActionMonitor after mount', async () => {
  const w = mount(DialogActionMonitor, {
    global: monitorDialogGlobal,
    props: {
      directHistorySnapshot: buildSampleHistory()
    }
  })

  await flushPromises()
  await w.setProps({ directInput: 'ActionMonitor' })
  await flushPromises()

  expect(w.find('.action-monitor-qdialog-inner').exists()).toBe(true)
  w.unmount()
})

/**
 * DialogActionMonitor
 * directInput watch should ignore unrelated dialog names.
 */
test('Test that DialogActionMonitor directInput watch skips other dialog names', async () => {
  const w = mount(DialogActionMonitor, {
    global: monitorDialogGlobal,
    props: {
      directHistorySnapshot: buildSampleHistory()
    }
  })

  await flushPromises()
  await w.setProps({ directInput: 'KeybindSettings' })
  await flushPromises()

  expect(w.find('.action-monitor-qdialog-inner').exists()).toBe(false)
  w.unmount()
})

/**
 * DialogActionMonitor
 * resolveDialogComponentStore should swallow failures after registerComponentDialogStackGuard captured a store instance.
 */
test('Test that DialogActionMonitor tolerates S_DialogComponent throwing from the resolve helper', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const orig = dialogStores.S_DialogComponent
  let calls = 0
  vi.spyOn(dialogStores, 'S_DialogComponent').mockImplementation(() => {
    calls += 1
    if (calls === 1) {
      return orig()
    }
    throw new Error('component dialog store unavailable')
  })

  const w = mount(DialogActionMonitor, {
    global: monitorDialogGlobal,
    props: {
      directHistorySnapshot: buildSampleHistory(),
      directInput: 'ActionMonitor'
    }
  })

  await flushPromises()
  w.unmount()
})

/**
 * DialogActionMonitor
 * Clicking a rendered row should call the clipboard helper with that row's entry.
 */
test('Test that clicking a DialogActionMonitor row dispatches the clipboard helper for that row', async () => {
  const copySpy = vi.spyOn(rowClipboardModule, 'copyDialogActionMonitorRowToClipboard').mockResolvedValue(undefined)

  const w = mount(DialogActionMonitor, {
    global: monitorDialogGlobal,
    props: {
      directHistorySnapshot: buildSampleHistory(),
      directInput: 'ActionMonitor'
    }
  })

  await flushPromises()

  const rows = w.findAll('[data-test-locator="stub-q-table-row"]')
  expect(rows.length).toBeGreaterThan(0)
  await rows[0]?.trigger('click')
  await flushPromises()

  expect(copySpy).toHaveBeenCalledOnce()
  const calledWith = copySpy.mock.calls[0]?.[0] as I_faActionHistoryEntry | undefined
  expect(calledWith?.uid).toBe('uid-success')

  copySpy.mockRestore()
  w.unmount()
})

/**
 * DialogActionMonitor
 * Without a directHistorySnapshot the dialog should call snapshotActionHistory and render its result.
 * Empty store history should render the empty-state.
 */
test('Test that DialogActionMonitor falls back to snapshotActionHistory when no directHistorySnapshot is provided', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)

  const w = mount(DialogActionMonitor, {
    global: {
      ...monitorDialogGlobal,
      plugins: [pinia]
    },
    props: {
      directInput: 'ActionMonitor'
    }
  })

  await flushPromises()

  expect(w.text()).toContain('dialogs.actionMonitor.emptyState')
  w.unmount()
})
