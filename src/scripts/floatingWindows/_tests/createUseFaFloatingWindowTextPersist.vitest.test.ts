import { ref } from 'vue'
import { ResultAsync } from 'neverthrow'
import { expect, test, vi } from 'vitest'

import { createUseFaFloatingWindowTextPersist } from '../functions/createUseFaFloatingWindowTextPersist'

test('Test that createUseFaFloatingWindowTextPersist waits for an in-flight write before project replacement', async () => {
  let resolvePersist: (() => void) | undefined
  let persistCalls = 0
  const persistText = vi.fn(() => {
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
  const textWatches: Array<() => void> = []

  const useFaFloatingWindowTextPersist = createUseFaFloatingWindowTextPersist({
    ResultAsync,
    debounce,
    registerBeforeProjectReplacement: (flush: () => Promise<void>) => {
      registered.push(flush)
    },
    runFaAction: vi.fn(),
    watch: (source, effect) => {
      if (typeof source !== 'function') {
        textWatches.push(() => {
          effect()
        })
      }
    }
  })

  const text = ref('alpha')
  useFaFloatingWindowTextPersist({
    failureActionId: 'reportAppNoteboardSaveFailure',
    persistText,
    text,
    windowModel: ref(true)
  })

  const onText = textWatches[0]
  if (onText === undefined) {
    throw new Error('missing text watch')
  }
  onText()
  expect(persistText).toHaveBeenCalledTimes(1)

  text.value = 'beta'
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
  expect(persistText).toHaveBeenCalledTimes(1)
  expect(cancel).toHaveBeenCalledOnce()

  const finishPersist = resolvePersist
  if (finishPersist === undefined) {
    throw new Error('missing persist resolver')
  }
  finishPersist()
  await replacement

  expect(replacementDone).toBe(true)
  expect(persistText).toHaveBeenCalledTimes(2)
})

function mountDeferredTextPersist (guards: {
  isProjectReplacementInFlight?: () => boolean
  readProjectContentEpoch?: () => number
} = {}) {
  const persistText = vi.fn(async () => undefined)
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
  const textWatches: Array<() => void> = []
  const useFaFloatingWindowTextPersist = createUseFaFloatingWindowTextPersist({
    ResultAsync,
    debounce,
    registerBeforeProjectReplacement: (hook: () => Promise<void>) => {
      registered.push(hook)
    },
    runFaAction: vi.fn(),
    watch: (source, effect) => {
      if (typeof source !== 'function') {
        textWatches.push(() => {
          effect()
        })
      }
    }
  })
  useFaFloatingWindowTextPersist({
    ...guards,
    failureActionId: 'reportProjectNoteboardSaveFailure',
    persistText,
    text: ref('alpha'),
    windowModel: ref(true)
  })
  function flushDebounce (): void {
    if (flushQueued === undefined) {
      throw new Error('missing debounce flush')
    }
    flushQueued()
  }
  return {
    flush: flushDebounce,
    persistText,
    registered,
    textWatches
  }
}

test('Test that createUseFaFloatingWindowTextPersist skips a queued write after the project changes', () => {
  let epoch = 1
  const mounted = mountDeferredTextPersist({
    readProjectContentEpoch: () => epoch
  })
  const onText = mounted.textWatches[0]
  if (onText === undefined) {
    throw new Error('missing text watch')
  }
  onText()
  epoch = 2
  mounted.flush()
  expect(mounted.persistText).not.toHaveBeenCalled()
})

test('Test that createUseFaFloatingWindowTextPersist skips a queued write during a project switch', () => {
  const mounted = mountDeferredTextPersist({
    isProjectReplacementInFlight: () => true,
    readProjectContentEpoch: () => 1
  })
  const onText = mounted.textWatches[0]
  if (onText === undefined) {
    throw new Error('missing text watch')
  }
  onText()
  mounted.flush()
  expect(mounted.persistText).not.toHaveBeenCalled()
})

test('Test that createUseFaFloatingWindowTextPersist still writes before project replacement during a switch', async () => {
  const mounted = mountDeferredTextPersist({
    isProjectReplacementInFlight: () => true,
    readProjectContentEpoch: () => 4
  })
  const flushBeforeReplacement = mounted.registered[0]
  if (flushBeforeReplacement === undefined) {
    throw new Error('missing project replacement flush')
  }
  await flushBeforeReplacement()
  expect(mounted.persistText).toHaveBeenCalledOnce()
})

test('Test that createUseFaFloatingWindowTextPersist still writes when project guards are omitted', () => {
  const mounted = mountDeferredTextPersist()
  const onText = mounted.textWatches[0]
  if (onText === undefined) {
    throw new Error('missing text watch')
  }
  onText()
  mounted.flush()
  expect(mounted.persistText).toHaveBeenCalledOnce()
})
