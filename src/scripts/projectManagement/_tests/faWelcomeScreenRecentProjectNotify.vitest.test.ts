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

import { notifyWelcomeScreenRecentProjectFileMissing } from '../faWelcomeScreenRecentProjectNotify'

beforeEach(() => {
  vi.mocked(Notify.create).mockClear()
})

/**
 * notifyWelcomeScreenRecentProjectFileMissing
 * Surfaces a negative Notify with the missing project display name.
 */
test('Test that notifyWelcomeScreenRecentProjectFileMissing shows negative Notify with project name', () => {
  notifyWelcomeScreenRecentProjectFileMissing('Gone Project')

  expect(Notify.create).toHaveBeenCalledWith({
    message:
      'globalFunctionality.faProjectSession.notifyRecentProjectFileMissing|Gone Project',
    type: 'negative',
    timeout: 10_000
  })
})
