/** @vitest-environment jsdom */
/* eslint-disable vue/one-component-per-file -- colocated defineComponent harness for composable */
import { defineComponent, nextTick, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const { runFaActionAwaitMock, runFaActionMock } = vi.hoisted(() => {
  return {
    runFaActionAwaitMock: vi.fn(async () => true),
    runFaActionMock: vi.fn()
  }
})

vi.mock('app/src/scripts/actionManager/faActionManagerRun_manager', async (importOriginal) => {
  const actual = await importOriginal<typeof import('app/src/scripts/actionManager/faActionManagerRun_manager')>()
  return {
    ...actual,
    runFaAction: runFaActionMock,
    runFaActionAwait: runFaActionAwaitMock
  }
})

import { S_FaProjectNoteboard } from 'app/src/stores/S_FaProjectNoteboard'
import { useWindowProjectNoteboardTextPersist } from '../windowProjectNoteboard_manager'

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

test('useWindowProjectNoteboardTextPersist debounces text writes when the window is open', async () => {
  const store = S_FaProjectNoteboard()
  const persistSpy = vi.spyOn(store, 'persistCurrentTextSilent').mockResolvedValue(undefined)

  const text = ref('a')
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useWindowProjectNoteboardTextPersist({
        text,
        windowModel
      })
      return () => null
    }
  })

  mount(Harness, { global: { plugins: [pinia] } })

  text.value = 'ab'
  await nextTick()
  vi.advanceTimersByTime(379)
  expect(persistSpy).not.toHaveBeenCalled()
  vi.advanceTimersByTime(1)
  await flushPromises()
  expect(persistSpy).toHaveBeenCalledTimes(1)
})

test('useWindowProjectNoteboardTextPersist ignores typing while the window is closed', async () => {
  const store = S_FaProjectNoteboard()
  const persistSpy = vi.spyOn(store, 'persistCurrentTextSilent').mockResolvedValue(undefined)

  const text = ref('x')
  const windowModel = ref(false)

  const Harness = defineComponent({
    setup () {
      useWindowProjectNoteboardTextPersist({
        text,
        windowModel
      })
      return () => null
    }
  })

  mount(Harness, { global: { plugins: [pinia] } })

  text.value = 'xy'
  await nextTick()
  vi.advanceTimersByTime(500)
  await flushPromises()
  expect(persistSpy).not.toHaveBeenCalled()
})

test('useWindowProjectNoteboardTextPersist flushes on hide without persisting when already closed', async () => {
  const store = S_FaProjectNoteboard()
  const persistSpy = vi.spyOn(store, 'persistCurrentTextSilent').mockResolvedValue(undefined)

  const text = ref('open')
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useWindowProjectNoteboardTextPersist({
        text,
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

test('useWindowProjectNoteboardTextPersist reports action failures from silent persist', async () => {
  const store = S_FaProjectNoteboard()
  vi.spyOn(store, 'persistCurrentTextSilent').mockRejectedValue(new Error('write failed'))

  const text = ref('t')
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useWindowProjectNoteboardTextPersist({
        text,
        windowModel
      })
      return () => null
    }
  })

  mount(Harness, { global: { plugins: [pinia] } })

  text.value = 'tx'
  await nextTick()
  vi.advanceTimersByTime(380)
  await flushPromises()
  expect(runFaActionMock).toHaveBeenCalledWith('reportProjectNoteboardSaveFailure', {
    message: 'write failed'
  })
})

test('useWindowProjectNoteboardTextPersist skips a scheduled persist when the window closes before debounce', async () => {
  const store = S_FaProjectNoteboard()
  const persistSpy = vi.spyOn(store, 'persistCurrentTextSilent').mockResolvedValue(undefined)

  const text = ref('a')
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useWindowProjectNoteboardTextPersist({
        text,
        windowModel
      })
      return () => null
    }
  })

  mount(Harness, { global: { plugins: [pinia] } })

  text.value = 'ab'
  await nextTick()
  windowModel.value = false
  await nextTick()
  vi.advanceTimersByTime(380)
  await flushPromises()
  expect(persistSpy).not.toHaveBeenCalled()
})

test('useWindowProjectNoteboardTextPersist stringifies non-Error rejections', async () => {
  const store = S_FaProjectNoteboard()
  vi.spyOn(store, 'persistCurrentTextSilent').mockRejectedValue(404)

  const text = ref('t')
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useWindowProjectNoteboardTextPersist({
        text,
        windowModel
      })
      return () => null
    }
  })

  mount(Harness, { global: { plugins: [pinia] } })

  text.value = 'ty'
  await nextTick()
  vi.advanceTimersByTime(380)
  await flushPromises()
  expect(runFaActionMock).toHaveBeenCalledWith('reportProjectNoteboardSaveFailure', {
    message: '404'
  })
})

test('useWindowProjectNoteboardTextPersist coerces null rejections to a string message', async () => {
  const store = S_FaProjectNoteboard()
  vi.spyOn(store, 'persistCurrentTextSilent').mockRejectedValue(null)

  const text = ref('n')
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useWindowProjectNoteboardTextPersist({
        text,
        windowModel
      })
      return () => null
    }
  })

  mount(Harness, { global: { plugins: [pinia] } })

  text.value = 'nx'
  await nextTick()
  vi.advanceTimersByTime(380)
  await flushPromises()
  expect(runFaActionMock).toHaveBeenCalledWith('reportProjectNoteboardSaveFailure', {
    message: 'null'
  })
})
