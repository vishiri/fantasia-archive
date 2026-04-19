import { beforeEach, expect, test, vi } from 'vitest'

const store = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return {
    tableMaxHeightPx: ref<number | null>(null)
  }
})

let lastGetSectionElement: (() => HTMLElement | null) | undefined

vi.mock('app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsTableLayoutObserve', () => ({
  useDialogKeybindSettingsTableLayout: (opts: {
    dialogModel: ReturnType<typeof import('vue').ref<boolean>>
    getSectionElement: () => HTMLElement | null
  }) => {
    lastGetSectionElement = opts.getSectionElement
    return {
      tableMaxHeightPx: store.tableMaxHeightPx
    }
  }
}))

import { ref } from 'vue'

import { useDialogActionMonitorTableLayout } from '../useDialogActionMonitorTableLayout'

beforeEach(() => {
  store.tableMaxHeightPx.value = null
  lastGetSectionElement = undefined
})

/**
 * useDialogActionMonitorTableLayout
 * Wires getSectionElement to the scroll host ref so layout reads the table host element.
 */
test('Test that useDialogActionMonitorTableLayout getSectionElement returns the scroll host ref value', () => {
  const dialogModel = ref(false)
  const { tableScrollHostRef } = useDialogActionMonitorTableLayout(dialogModel)
  expect(lastGetSectionElement).toBeTypeOf('function')
  const host = document.createElement('div')
  tableScrollHostRef.value = host
  expect(lastGetSectionElement?.()).toBe(host)
})

/**
 * useDialogActionMonitorTableLayout
 * Exposes a q-table style object with maxHeight when the keybind layout hook reports a pixel height.
 */
test('Test that useDialogActionMonitorTableLayout maps tableMaxHeightPx to maxHeight style', () => {
  const dialogModel = ref(false)
  const { dialogActionMonitorTableHeightStyle } = useDialogActionMonitorTableLayout(dialogModel)
  expect(dialogActionMonitorTableHeightStyle.value).toBeUndefined()
  store.tableMaxHeightPx.value = 312
  expect(dialogActionMonitorTableHeightStyle.value).toEqual({
    maxHeight: '312px'
  })
})
