import { ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import { createUseFaFloatingWindowFramePersist } from '../functions/createUseFaFloatingWindowFramePersist'

test('Test that createUseFaFloatingWindowFramePersist flushes debounce when the window closes', async () => {
  const persistFrame = vi.fn(async () => undefined)
  const flushed = vi.fn()
  const debounced = Object.assign(vi.fn(), {
    flush: flushed
  })
  function debounce<T extends (...args: never[]) => void> (
    fn: T,
    _wait: number
  ): T & { flush: () => void } {
    debounced.mockImplementation(fn)
    return debounced as unknown as T & { flush: () => void }
  }
  const watch = vi.fn()

  const useFaFloatingWindowFramePersist = createUseFaFloatingWindowFramePersist({
    debounce,
    runFaAction: vi.fn(),
    watch
  })

  const windowModel = ref(true)
  useFaFloatingWindowFramePersist({
    failureActionId: 'reportAppStylingPersistFailure',
    h: ref(1),
    persistFrame,
    w: ref(1),
    windowModel,
    x: ref(0),
    y: ref(0)
  })

  windowModel.value = false

  const modelWatch = watch.mock.calls.find((call) => typeof call[0]! === 'function')
  expect(modelWatch).toBeDefined()
  const onModelChange = modelWatch?.[1]! as (open: boolean, wasOpen: boolean) => void
  onModelChange(false, true)

  expect(flushed).toHaveBeenCalledOnce()
  expect(persistFrame).not.toHaveBeenCalled()
})

test('Test that createUseFaFloatingWindowFramePersist persists on close when the model is still open', async () => {
  const persistFrame = vi.fn(async () => undefined)
  const flushed = vi.fn()
  const debounced = Object.assign(vi.fn(), {
    flush: flushed
  })
  function debounce<T extends (...args: never[]) => void> (
    fn: T,
    _wait: number
  ): T & { flush: () => void } {
    debounced.mockImplementation(fn)
    return debounced as unknown as T & { flush: () => void }
  }
  const watch = vi.fn()

  const useFaFloatingWindowFramePersist = createUseFaFloatingWindowFramePersist({
    debounce,
    runFaAction: vi.fn(),
    watch
  })

  const windowModel = ref(true)
  useFaFloatingWindowFramePersist({
    failureActionId: 'reportAppStylingPersistFailure',
    h: ref(1),
    persistFrame,
    w: ref(1),
    windowModel,
    x: ref(0),
    y: ref(0)
  })

  const modelWatch = watch.mock.calls.find((call) => typeof call[0]! === 'function')
  const onModelChange = modelWatch?.[1]! as (open: boolean, wasOpen: boolean) => void
  onModelChange(false, true)
  await flushPromises()

  expect(flushed).toHaveBeenCalledOnce()
  expect(persistFrame).toHaveBeenCalledOnce()
})
