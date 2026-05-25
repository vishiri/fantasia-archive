/** @vitest-environment jsdom */
/* eslint-disable vue/one-component-per-file -- composable harness */
import { defineComponent, nextTick, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { useFaFloatingWindowTextPersist } from '../useFaFloatingWindowTextPersist'

const runFaActionMock = vi.hoisted(() => vi.fn())

vi.mock('app/src/scripts/actionManager/faActionManagerRun', () => ({
  runFaAction: runFaActionMock
}))

beforeEach(() => {
  vi.useFakeTimers()
  runFaActionMock.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

/**
 * useFaFloatingWindowTextPersist
 * Debounces text persistence while the window stays open.
 */
test('Test that useFaFloatingWindowTextPersist debounces persistText calls', async () => {
  const persistText = vi.fn(async () => undefined)
  const text = ref('alpha')
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useFaFloatingWindowTextPersist({
        failureActionId: 'reportAppNoteboardSaveFailure',
        persistText,
        text,
        windowModel
      })
      return () => null
    }
  })

  mount(Harness)
  text.value = 'beta'
  await nextTick()
  vi.advanceTimersByTime(380)
  await flushPromises()
  expect(persistText).toHaveBeenCalledOnce()
})

/**
 * useFaFloatingWindowTextPersist
 * Reports text persist failures through the action manager.
 */
test('Test that useFaFloatingWindowTextPersist reports persist failures', async () => {
  const persistText = vi.fn(async () => {
    throw new Error('text persist failed')
  })
  const text = ref('alpha')
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useFaFloatingWindowTextPersist({
        failureActionId: 'reportAppNoteboardSaveFailure',
        persistText,
        text,
        windowModel
      })
      return () => null
    }
  })

  mount(Harness)
  text.value = 'beta'
  await nextTick()
  vi.advanceTimersByTime(380)
  await flushPromises()
  expect(runFaActionMock).toHaveBeenCalledWith('reportAppNoteboardSaveFailure', { message: 'text persist failed' })
})

/**
 * useFaFloatingWindowTextPersist
 * Ignores text edits while the window is closed.
 */
test('Test that useFaFloatingWindowTextPersist ignores text edits while closed', async () => {
  const persistText = vi.fn(async () => undefined)
  const text = ref('alpha')
  const windowModel = ref(false)

  const Harness = defineComponent({
    setup () {
      useFaFloatingWindowTextPersist({
        failureActionId: 'reportAppNoteboardSaveFailure',
        persistText,
        text,
        windowModel
      })
      return () => null
    }
  })

  mount(Harness)
  text.value = 'beta'
  await nextTick()
  vi.advanceTimersByTime(380)
  await flushPromises()
  expect(persistText).not.toHaveBeenCalled()
})

/**
 * useFaFloatingWindowTextPersist
 * Runs the close watcher without persisting after the model is false.
 */
test('Test that useFaFloatingWindowTextPersist does not persist after close', async () => {
  const persistText = vi.fn(async () => undefined)
  const text = ref('alpha')
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useFaFloatingWindowTextPersist({
        failureActionId: 'reportAppNoteboardSaveFailure',
        persistText,
        text,
        windowModel
      })
      return () => null
    }
  })

  mount(Harness)
  windowModel.value = false
  await nextTick()
  vi.advanceTimersByTime(0)
  await flushPromises()
  expect(persistText).not.toHaveBeenCalled()
})

/**
 * useFaFloatingWindowTextPersist
 * Stringifies non-Error rejections before reporting.
 */
test('Test that useFaFloatingWindowTextPersist stringifies non-Error rejections', async () => {
  const persistText = vi.fn(async () => {
    // eslint-disable-next-line no-throw-literal -- exercises non-Error branch
    throw 'raw failure'
  })
  const text = ref('alpha')
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useFaFloatingWindowTextPersist({
        failureActionId: 'reportAppNoteboardSaveFailure',
        persistText,
        text,
        windowModel
      })
      return () => null
    }
  })

  mount(Harness)
  text.value = 'beta'
  await nextTick()
  vi.advanceTimersByTime(380)
  await flushPromises()
  expect(runFaActionMock).toHaveBeenCalledWith('reportAppNoteboardSaveFailure', { message: 'raw failure' })
})
