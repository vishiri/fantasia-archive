/** @vitest-environment jsdom */
/* eslint-disable vue/one-component-per-file -- colocated defineComponent harness for composable */
import { defineComponent, nextTick, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const { runFaActionMock } = vi.hoisted(() => {
  return {
    runFaActionMock: vi.fn()
  }
})

vi.mock('app/src/scripts/actionManager/faActionManagerRun', () => {
  return {
    runFaAction: runFaActionMock
  }
})

import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'
import { useWindowProjectStylingCssPersist } from '../useWindowProjectStylingCssPersist'

let pinia: ReturnType<typeof createPinia>

beforeEach(() => {
  vi.useFakeTimers()
  pinia = createPinia()
  setActivePinia(pinia)
  runFaActionMock.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

test('useWindowProjectStylingCssPersist debounces css writes while the window is open', async () => {
  const store = S_FaProjectStyling()
  const persistSpy = vi
    .spyOn(store, 'persistProjectStylingPartialSilent')
    .mockResolvedValue(undefined)

  const css = ref('a')
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useWindowProjectStylingCssPersist({
        css,
        windowModel
      })
      return () => null
    }
  })

  mount(Harness, { global: { plugins: [pinia] } })

  css.value = 'ab'
  await nextTick()
  vi.advanceTimersByTime(379)
  expect(persistSpy).not.toHaveBeenCalled()
  vi.advanceTimersByTime(1)
  await flushPromises()
  expect(persistSpy).toHaveBeenCalledTimes(1)
  expect(persistSpy).toHaveBeenCalledWith({
    css: 'ab'
  })
})

test('useWindowProjectStylingCssPersist ignores css edits while the window is closed', async () => {
  const store = S_FaProjectStyling()
  const persistSpy = vi
    .spyOn(store, 'persistProjectStylingPartialSilent')
    .mockResolvedValue(undefined)

  const css = ref('x')
  const windowModel = ref(false)

  const Harness = defineComponent({
    setup () {
      useWindowProjectStylingCssPersist({
        css,
        windowModel
      })
      return () => null
    }
  })

  mount(Harness, { global: { plugins: [pinia] } })

  css.value = 'xy'
  await nextTick()
  vi.advanceTimersByTime(500)
  await flushPromises()
  expect(persistSpy).not.toHaveBeenCalled()
})

test('useWindowProjectStylingCssPersist skips persist when hide fires while window already stayed closed', async () => {
  const store = S_FaProjectStyling()
  const persistSpy = vi
    .spyOn(store, 'persistProjectStylingPartialSilent')
    .mockResolvedValue(undefined)

  const css = ref('open')
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useWindowProjectStylingCssPersist({
        css,
        windowModel
      })
      return () => null
    }
  })

  mount(Harness, { global: { plugins: [pinia] } })

  windowModel.value = false
  await nextTick()
  vi.advanceTimersByTime(0)
  await flushPromises()
  expect(persistSpy).not.toHaveBeenCalled()
})

test('useWindowProjectStylingCssPersist reports action failures from silent persist', async () => {
  const store = S_FaProjectStyling()
  vi.spyOn(store, 'persistProjectStylingPartialSilent').mockRejectedValue(new Error('write failed'))

  const css = ref('t')
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useWindowProjectStylingCssPersist({
        css,
        windowModel
      })
      return () => null
    }
  })

  mount(Harness, { global: { plugins: [pinia] } })

  css.value = 'tx'
  await nextTick()
  vi.advanceTimersByTime(380)
  await flushPromises()
  expect(runFaActionMock).toHaveBeenCalledWith('reportProjectStylingSaveFailure', {
    message: 'write failed'
  })
})

test('useWindowProjectStylingCssPersist skips debounced persist when the window closes first', async () => {
  const store = S_FaProjectStyling()
  const persistSpy = vi
    .spyOn(store, 'persistProjectStylingPartialSilent')
    .mockResolvedValue(undefined)

  const css = ref('a')
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useWindowProjectStylingCssPersist({
        css,
        windowModel
      })
      return () => null
    }
  })

  mount(Harness, { global: { plugins: [pinia] } })

  css.value = 'ab'
  await nextTick()
  windowModel.value = false
  await nextTick()
  vi.advanceTimersByTime(380)
  await flushPromises()
  expect(persistSpy).not.toHaveBeenCalled()
})

test('useWindowProjectStylingCssPersist stringifies non-Error rejections', async () => {
  const store = S_FaProjectStyling()
  vi.spyOn(store, 'persistProjectStylingPartialSilent').mockRejectedValue(404)

  const css = ref('t')
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useWindowProjectStylingCssPersist({
        css,
        windowModel
      })
      return () => null
    }
  })

  mount(Harness, { global: { plugins: [pinia] } })

  css.value = 'ty'
  await nextTick()
  vi.advanceTimersByTime(380)
  await flushPromises()
  expect(runFaActionMock).toHaveBeenCalledWith('reportProjectStylingSaveFailure', {
    message: '404'
  })
})

test('useWindowProjectStylingCssPersist coerces null rejections to a string message', async () => {
  const store = S_FaProjectStyling()
  vi.spyOn(store, 'persistProjectStylingPartialSilent').mockRejectedValue(null)

  const css = ref('t')
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useWindowProjectStylingCssPersist({
        css,
        windowModel
      })
      return () => null
    }
  })

  mount(Harness, { global: { plugins: [pinia] } })

  css.value = 'tn'
  await nextTick()
  vi.advanceTimersByTime(380)
  await flushPromises()
  expect(runFaActionMock).toHaveBeenCalledWith('reportProjectStylingSaveFailure', {
    message: 'null'
  })
})
