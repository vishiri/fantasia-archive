/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'

import { Notify } from 'quasar'

vi.mock('quasar', () => ({
  Notify: { create: vi.fn() }
}))

vi.mock('app/i18n/externalFileLoader', () => ({
  i18n: {
    global: {
      t: vi.fn((key: string) => key)
    }
  }
}))

import { reportFaTemporaryDocumentCreateFailure } from '../reportFaTemporaryDocumentCreateFailureWiring'

beforeEach(() => {
  vi.mocked(Notify.create).mockClear()
})

/**
 * reportFaTemporaryDocumentCreateFailure
 * Uses the thrown message when create already translated it.
 */
test('Test that reportFaTemporaryDocumentCreateFailure toasts an Error message', () => {
  reportFaTemporaryDocumentCreateFailure(new Error('Could not create the document.'))
  expect(Notify.create).toHaveBeenCalledWith({
    faSkipNotifyConsoleLog: true,
    group: false,
    message: 'Could not create the document.',
    type: 'negative'
  })
})

/**
 * reportFaTemporaryDocumentCreateFailure
 * Blank or non-Error failures use the shared create error string.
 */
test('Test that reportFaTemporaryDocumentCreateFailure toasts the fallback for a blank error', () => {
  reportFaTemporaryDocumentCreateFailure(new Error('   '))
  expect(Notify.create).toHaveBeenCalledWith({
    faSkipNotifyConsoleLog: true,
    group: false,
    message: 'globalFunctionality.faOpenedDocuments.createTemporaryError',
    type: 'negative'
  })
})

/**
 * reportFaTemporaryDocumentCreateFailure
 * A string rejection is shown as-is.
 */
test('Test that reportFaTemporaryDocumentCreateFailure toasts a string rejection', () => {
  reportFaTemporaryDocumentCreateFailure('disk full')
  expect(Notify.create).toHaveBeenCalledWith({
    faSkipNotifyConsoleLog: true,
    group: false,
    message: 'disk full',
    type: 'negative'
  })
})
