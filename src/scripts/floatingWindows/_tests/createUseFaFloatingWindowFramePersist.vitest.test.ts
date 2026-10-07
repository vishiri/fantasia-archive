import { ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { ResultAsync } from 'neverthrow'
import { expect, test, vi } from 'vitest'

import { createUseFaFloatingWindowFramePersist } from '../functions/createUseFaFloatingWindowFramePersist'

test('Test that createUseFaFloatingWindowFramePersist flushes debounce when the window closes', async () => {
  const persistFrame = vi.fn(async () => undefined)
  const flushed = vi.fn()
  const debounced = Object.assign(vi.fn(), {
    cancel: vi.fn(),
    flush: flushed
  })
  function debounce<T extends (...args: never[]) => void> (
    fn: T,
    _wait: number
  ): T & { cancel: () => void, flush: () => void } {
    debounced.mockImplementation(fn)
    return debounced as unknown as T & { cancel: () => void, flush: () => void }
  }
  const watch = vi.fn()

  const useFaFloatingWindowFramePersist = createUseFaFloatingWindowFramePersist({
    ResultAsync,
    debounce,
    registerBeforeProjectReplacement: vi.fn(),
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
    cancel: vi.fn(),
    flush: flushed
  })
  function debounce<T extends (...args: never[]) => void> (
    fn: T,
    _wait: number
  ): T & { cancel: () => void, flush: () => void } {
    debounced.mockImplementation(fn)
    return debounced as unknown as T & { cancel: () => void, flush: () => void }
  }
  const watch = vi.fn()

  const useFaFloatingWindowFramePersist = createUseFaFloatingWindowFramePersist({
    ResultAsync,
    debounce,
    registerBeforeProjectReplacement: vi.fn(),
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

test('Test that createUseFaFloatingWindowFramePersist flushes an open frame before project replacement', async () => {
  const persistFrame = vi.fn(async () => undefined)
  const cancel = vi.fn()
  const debounced = Object.assign(vi.fn(), {
    cancel,
    flush: vi.fn()
  })
  function debounce<T extends (...args: never[]) => void> (
    fn: T,
    _wait: number
  ): T & { cancel: () => void, flush: () => void } {
    debounced.mockImplementation(fn)
    return debounced as unknown as T & { cancel: () => void, flush: () => void }
  }
  const registered: Array<() => Promise<void>> = []

  const useFaFloatingWindowFramePersist = createUseFaFloatingWindowFramePersist({
    ResultAsync,
    debounce,
    registerBeforeProjectReplacement: (flush: () => Promise<void>) => {
      registered.push(flush)
    },
    runFaAction: vi.fn(),
    watch: vi.fn()
  })

  useFaFloatingWindowFramePersist({
    failureActionId: 'reportAppStylingPersistFailure',
    h: ref(1),
    persistFrame,
    w: ref(1),
    windowModel: ref(true),
    x: ref(0),
    y: ref(0)
  })

  const flushBeforeReplacement = registered[0]
  if (flushBeforeReplacement === undefined) {
    throw new Error('missing project replacement flush')
  }
  await flushBeforeReplacement()
  expect(cancel).toHaveBeenCalledOnce()
  expect(persistFrame).toHaveBeenCalledOnce()
})

test('Test that createUseFaFloatingWindowFramePersist waits for an in-flight write before project replacement', async () => {
  let resolvePersist: (() => void) | undefined
  let persistCalls = 0
  const persistFrame = vi.fn(() => {
    persistCalls += 1
    if (persistCalls === 1) {
      return new Promise<void>((resolve) => {
        resolvePersist = resolve
      })
    }
    return Promise.resolve()
  })
  const cancel = vi.fn()
  function debounce<T extends (...args: never[]) => void> (
    fn: T,
    _wait: number
  ): T & { cancel: () => void, flush: () => void } {
    const wrapped = Object.assign(() => {
      fn()
    }, {
      cancel,
      flush: () => {
        fn()
      }
    })
    return wrapped as unknown as T & { cancel: () => void, flush: () => void }
  }
  const registered: Array<() => Promise<void>> = []
  const frameWatches: Array<() => void> = []

  const useFaFloatingWindowFramePersist = createUseFaFloatingWindowFramePersist({
    ResultAsync,
    debounce,
    registerBeforeProjectReplacement: (flush: () => Promise<void>) => {
      registered.push(flush)
    },
    runFaAction: vi.fn(),
    watch: (source, effect) => {
      if (Array.isArray(source)) {
        frameWatches.push(() => {
          effect()
        })
      }
    }
  })

  useFaFloatingWindowFramePersist({
    failureActionId: 'reportAppStylingPersistFailure',
    h: ref(1),
    persistFrame,
    w: ref(1),
    windowModel: ref(true),
    x: ref(0),
    y: ref(0)
  })

  const onFrame = frameWatches[0]
  if (onFrame === undefined) {
    throw new Error('missing frame watch')
  }
  onFrame()
  expect(persistFrame).toHaveBeenCalledTimes(1)

  const flushBeforeReplacement = registered[0]
  if (flushBeforeReplacement === undefined) {
    throw new Error('missing project replacement flush')
  }
  let replacementDone = false
  const replacement = flushBeforeReplacement().then(() => {
    replacementDone = true
  })
  await Promise.resolve()
  expect(replacementDone).toBe(false)
  expect(persistFrame).toHaveBeenCalledTimes(1)

  const finishPersist = resolvePersist
  if (finishPersist === undefined) {
    throw new Error('missing persist resolver')
  }
  finishPersist()
  await replacement

  expect(replacementDone).toBe(true)
  expect(persistFrame).toHaveBeenCalledTimes(2)
  expect(cancel).toHaveBeenCalledOnce()
})

function mountDeferredFramePersist (guards: {
  isProjectReplacementInFlight?: () => boolean
  readProjectContentEpoch?: () => number
} = {}) {
  const persistFrame = vi.fn(async () => undefined)
  const cancel = vi.fn()
  let flushQueued: (() => void) | undefined
  function debounce<T extends (...args: never[]) => void> (
    fn: T,
    _wait: number
  ): T & { cancel: () => void, flush: () => void } {
    const flush = () => {
      fn()
    }
    flushQueued = flush
    const wrapped = Object.assign(() => undefined, {
      cancel,
      flush
    })
    return wrapped as unknown as T & { cancel: () => void, flush: () => void }
  }
  const registered: Array<() => Promise<void>> = []
  const frameWatches: Array<() => void> = []
  const useFaFloatingWindowFramePersist = createUseFaFloatingWindowFramePersist({
    ResultAsync,
    debounce,
    registerBeforeProjectReplacement: (hook: () => Promise<void>) => {
      registered.push(hook)
    },
    runFaAction: vi.fn(),
    watch: (source, effect) => {
      if (Array.isArray(source)) {
        frameWatches.push(() => {
          effect()
        })
      }
    }
  })
  useFaFloatingWindowFramePersist({
    ...guards,
    failureActionId: 'reportProjectStylingSaveFailure',
    h: ref(1),
    persistFrame,
    w: ref(1),
    windowModel: ref(true),
    x: ref(0),
    y: ref(0)
  })
  function flushDebounce (): void {
    if (flushQueued === undefined) {
      throw new Error('missing debounce flush')
    }
    flushQueued()
  }
  return {
    flush: flushDebounce,
    frameWatches,
    persistFrame,
    registered
  }
}

test('Test that createUseFaFloatingWindowFramePersist skips a queued write after the project changes', () => {
  let epoch = 1
  const mounted = mountDeferredFramePersist({
    readProjectContentEpoch: () => epoch
  })
  const onFrame = mounted.frameWatches[0]
  if (onFrame === undefined) {
    throw new Error('missing frame watch')
  }
  onFrame()
  epoch = 2
  mounted.flush()
  expect(mounted.persistFrame).not.toHaveBeenCalled()
})

test('Test that createUseFaFloatingWindowFramePersist skips a queued write during a project switch', () => {
  const mounted = mountDeferredFramePersist({
    isProjectReplacementInFlight: () => true,
    readProjectContentEpoch: () => 1
  })
  const onFrame = mounted.frameWatches[0]
  if (onFrame === undefined) {
    throw new Error('missing frame watch')
  }
  onFrame()
  mounted.flush()
  expect(mounted.persistFrame).not.toHaveBeenCalled()
})

test('Test that createUseFaFloatingWindowFramePersist still writes before project replacement during a switch', async () => {
  const mounted = mountDeferredFramePersist({
    isProjectReplacementInFlight: () => true,
    readProjectContentEpoch: () => 4
  })
  const flushBeforeReplacement = mounted.registered[0]
  if (flushBeforeReplacement === undefined) {
    throw new Error('missing project replacement flush')
  }
  await flushBeforeReplacement()
  expect(mounted.persistFrame).toHaveBeenCalledOnce()
})

test('Test that createUseFaFloatingWindowFramePersist still writes when project guards are omitted', () => {
  const mounted = mountDeferredFramePersist()
  const onFrame = mounted.frameWatches[0]
  if (onFrame === undefined) {
    throw new Error('missing frame watch')
  }
  onFrame()
  mounted.flush()
  expect(mounted.persistFrame).toHaveBeenCalledOnce()
})
