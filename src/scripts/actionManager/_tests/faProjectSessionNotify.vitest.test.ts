/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'

import { Notify } from 'quasar'

vi.mock('quasar', () => ({
  Notify: { create: vi.fn() }
}))

vi.mock('app/i18n/externalFileLoader', () => ({
  i18n: {
    global: {
      t: vi.fn((key: string, params: { projectName: string }) => {
        return `${key}|${params.projectName}`
      })
    }
  }
}))

vi.mock('app/src/stores/S_FaActiveProject', () => ({
  S_FaActiveProject: () => ({
    activeProject: {
      filePath: 'C:\\x\\y.faproject',
      id: 'id-1',
      name: 'Stored'
    }
  })
}))

import {
  notifyFaProjectAlreadyActiveWarning,
  notifyFaProjectCreatedPositive,
  notifyFaProjectLoadedPositive
} from '../faProjectSessionNotify_manager'

beforeEach(() => {
  vi.mocked(Notify.create).mockClear()
})

/**
 * notifyFaProjectCreatedPositive
 */
test('Test that notifyFaProjectCreatedPositive shows a positive Notify with project label', () => {
  notifyFaProjectCreatedPositive()
  expect(Notify.create).toHaveBeenCalledWith({
    message:
      'globalFunctionality.faProjectSession.notifyProjectCreated|Stored',
    type: 'positive'
  })
})

/**
 * notifyFaProjectLoadedPositive
 */
test('Test that notifyFaProjectLoadedPositive shows a positive Notify with project label', () => {
  notifyFaProjectLoadedPositive()
  expect(Notify.create).toHaveBeenCalledWith({
    message:
      'globalFunctionality.faProjectSession.notifyProjectLoaded|Stored',
    type: 'positive'
  })
})

/**
 * notifyFaProjectAlreadyActiveWarning
 */
test('Test that notifyFaProjectAlreadyActiveWarning shows a warning Notify with project label', () => {
  notifyFaProjectAlreadyActiveWarning()
  expect(Notify.create).toHaveBeenCalledWith({
    message:
      'globalFunctionality.faProjectSession.openRejectedAlreadyActive|Stored',
    type: 'warning'
  })
})
