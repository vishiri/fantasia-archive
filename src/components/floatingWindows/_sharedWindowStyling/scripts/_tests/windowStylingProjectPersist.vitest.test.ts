import { ref } from 'vue'
import { ResultAsync } from 'neverthrow'
import { expect, test, vi } from 'vitest'

import type { T_vueWatch } from 'app/types/I_vueWatchInjected'
import { createWindowProjectStylingCssPersist } from '../functions/windowStylingProjectPersist'

test('Test that createWindowProjectStylingCssPersist waits for an in-flight write before project replacement', async () => {
  let resolvePersist: (() => void) | undefined
  let persistCalls = 0
  const persistProjectStylingPartialSilent = vi.fn(() => {
    persistCalls += 1
    if (persistCalls === 1) {
      return new Promise<void>((resolve) => {
        resolvePersist = resolve
      })
    }
    return Promise.resolve()
  })
  const cancel = vi.fn()
  function createDebounced<T extends (...args: never[]) => void> (
    fn: T,
    _waitMs: number
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
  const cssWatches: Array<() => void> = []
  const watch = ((source: unknown, effect: () => void) => {
    if (typeof source !== 'function') {
      cssWatches.push(effect)
    }
  }) as T_vueWatch

  const useWindowProjectStylingCssPersist = createWindowProjectStylingCssPersist({
    ResultAsync,
    createDebounced,
    getFaProjectStylingStore: () => ({
      clearCssLivePreview: () => undefined,
      css: '',
      cssLivePreview: null,
      persistProjectStylingPartialSilent,
      refreshProjectStyling: async () => true,
      setCssLivePreview: () => undefined
    }),
    registerBeforeProjectReplacement: (flush: () => Promise<void>) => {
      registered.push(flush)
    },
    runFaAction: vi.fn(),
    watch
  })

  const css = ref('.a{}')
  useWindowProjectStylingCssPersist({
    css,
    windowModel: ref(true)
  })

  const onCss = cssWatches[0]
  if (onCss === undefined) {
    throw new Error('missing css watch')
  }
  onCss()
  expect(persistProjectStylingPartialSilent).toHaveBeenCalledTimes(1)

  css.value = '.b{}'
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
  expect(persistProjectStylingPartialSilent).toHaveBeenCalledTimes(1)

  const finishPersist = resolvePersist
  if (finishPersist === undefined) {
    throw new Error('missing persist resolver')
  }
  finishPersist()
  await replacement

  expect(replacementDone).toBe(true)
  expect(persistProjectStylingPartialSilent).toHaveBeenCalledTimes(2)
  expect(persistProjectStylingPartialSilent).toHaveBeenLastCalledWith({ css: '.b{}' })
  expect(cancel).toHaveBeenCalledOnce()
})

function createFlushOnlyDebounce<T extends (...args: never[]) => void> (
  fn: T
): T & { cancel: () => void, flush: () => void } {
  let pending = false
  const wrapped = Object.assign(() => {
    pending = true
  }, {
    cancel: () => {
      pending = false
    },
    flush: () => {
      if (!pending) {
        return
      }
      pending = false
      fn()
    }
  })
  return wrapped as unknown as T & { cancel: () => void, flush: () => void }
}

test('Test that a project styling css persist does not write after the project changes', async () => {
  let epoch = 1
  let scheduledFlush: (() => void) | undefined
  const persistProjectStylingPartialSilent = vi.fn(async () => undefined)
  const cssWatches: Array<() => void> = []
  const watch = ((source: unknown, effect: () => void) => {
    if (typeof source !== 'function') {
      cssWatches.push(effect)
    }
  }) as T_vueWatch
  const useWindowProjectStylingCssPersist = createWindowProjectStylingCssPersist({
    ResultAsync,
    createDebounced: (fn) => {
      const wrapped = createFlushOnlyDebounce(fn)
      scheduledFlush = wrapped.flush
      return wrapped
    },
    getFaProjectStylingStore: () => ({
      clearCssLivePreview: () => undefined,
      css: '',
      cssLivePreview: null,
      persistProjectStylingPartialSilent,
      refreshProjectStyling: async () => true,
      setCssLivePreview: () => undefined
    }),
    isProjectReplacementInFlight: () => false,
    readProjectContentEpoch: () => epoch,
    registerBeforeProjectReplacement: () => undefined,
    runFaAction: vi.fn(),
    watch
  })
  useWindowProjectStylingCssPersist({
    css: ref('.kept{}'),
    windowModel: ref(true)
  })
  const onCss = cssWatches[0]
  if (onCss === undefined || scheduledFlush === undefined) {
    throw new Error('missing css persist schedule')
  }
  onCss()
  epoch = 2
  scheduledFlush()
  await Promise.resolve()
  expect(persistProjectStylingPartialSilent).not.toHaveBeenCalled()
})

test('Test that a project styling css persist does not write during a project switch', async () => {
  const inFlight = true
  let scheduledFlush: (() => void) | undefined
  const persistProjectStylingPartialSilent = vi.fn(async () => undefined)
  const registered: Array<() => Promise<void>> = []
  const cssWatches: Array<() => void> = []
  const watch = ((source: unknown, effect: () => void) => {
    if (typeof source !== 'function') {
      cssWatches.push(effect)
    }
  }) as T_vueWatch
  const useWindowProjectStylingCssPersist = createWindowProjectStylingCssPersist({
    ResultAsync,
    createDebounced: (fn) => {
      const wrapped = createFlushOnlyDebounce(fn)
      scheduledFlush = wrapped.flush
      return wrapped
    },
    getFaProjectStylingStore: () => ({
      clearCssLivePreview: () => undefined,
      css: '',
      cssLivePreview: null,
      persistProjectStylingPartialSilent,
      refreshProjectStyling: async () => true,
      setCssLivePreview: () => undefined
    }),
    isProjectReplacementInFlight: () => inFlight,
    readProjectContentEpoch: () => 1,
    registerBeforeProjectReplacement: (flush: () => Promise<void>) => {
      registered.push(flush)
    },
    runFaAction: vi.fn(),
    watch
  })
  const css = ref('.switch{}')
  useWindowProjectStylingCssPersist({
    css,
    windowModel: ref(true)
  })
  const onCss = cssWatches[0]
  const flushBeforeReplacement = registered[0]
  if (onCss === undefined || scheduledFlush === undefined || flushBeforeReplacement === undefined) {
    throw new Error('missing css persist schedule')
  }
  onCss()
  scheduledFlush()
  await Promise.resolve()
  expect(persistProjectStylingPartialSilent).not.toHaveBeenCalled()
  await flushBeforeReplacement()
  expect(persistProjectStylingPartialSilent).toHaveBeenCalledWith({
    css: '.switch{}'
  })
})
