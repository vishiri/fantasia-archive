import { expect, test, vi } from 'vitest'

const bootMock = vi.hoisted(() => {
  return vi.fn((callback: unknown) => callback)
})

const vuePluginInstallMock = vi.hoisted(() => {
  return vi.fn()
})

vi.mock('#q-app/wrappers', () => {
  return {
    defineBoot: bootMock
  }
})

vi.mock('quasar-ui-q-draggable-table', () => {
  return {
    default: {
      install: vuePluginInstallMock
    }
  }
})

vi.mock('quasar-ui-q-draggable-table/dist/index.css', () => ({}))

import qDraggableTableBoot from '../q-draggable-table'

/**
 * q-draggable-table boot file
 * Registers the v-draggable-table directive plugin on the app instance.
 */
test('Test that q-draggable-table boot installs the draggable table plugin on the app', () => {
  const appUseMock = vi.fn()

  qDraggableTableBoot({
    app: {
      use: appUseMock
    }
  } as never)

  expect(appUseMock).toHaveBeenCalledOnce()
  expect(appUseMock.mock.calls[0]![0]!).toMatchObject({
    install: vuePluginInstallMock
  })
})
