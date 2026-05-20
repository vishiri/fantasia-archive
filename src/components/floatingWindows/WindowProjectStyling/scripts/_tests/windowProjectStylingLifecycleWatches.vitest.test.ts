/** @vitest-environment jsdom */
import { flushPromises, mount } from '@vue/test-utils'
import {
  defineComponent,
  nextTick,
  ref
} from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import {
  afterEach,
  beforeEach,
  expect,
  test,
  vi
} from 'vitest'

import { FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS } from 'app/src/scripts/floatingWindows/faQuasarDialogStandardTransition'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'

import * as stylingSide from '../windowProjectStylingStateSideEffects'
import {
  registerProjectStylingActiveProjectWatch,
  registerProjectStylingUnmount,
  registerProjectStylingWindowModelWatch
} from '../windowProjectStylingLifecycleWatches'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

test('registerProjectStylingWindowModelWatch runs show on open and defers hide on close past the transition', async () => {
  setActivePinia(createPinia())

  const hideAfterTransitionId = ref<number | null>(null)
  const onWindowShow = vi.fn(async () => {
    await Promise.resolve()
  })
  const onWindowHide = vi.fn()
  const clearLivePreview = vi.fn()
  const windowModel = ref(false)

  registerProjectStylingWindowModelWatch({
    clearLivePreview,
    hideAfterTransitionId,
    onWindowHide,
    onWindowShow,
    windowModel
  })

  windowModel.value = true
  await flushPromises()
  expect(onWindowShow).toHaveBeenCalledTimes(1)

  windowModel.value = false
  await flushPromises()
  expect(clearLivePreview).toHaveBeenCalledTimes(1)

  vi.advanceTimersByTime(FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS - 1)
  expect(onWindowHide).not.toHaveBeenCalled()

  vi.advanceTimersByTime(1)
  expect(onWindowHide).toHaveBeenCalledTimes(1)
  expect(hideAfterTransitionId.value).toBe(null)
})

test('registerProjectStylingWindowModelWatch cancels pending hide timers when reopened', async () => {
  setActivePinia(createPinia())

  const hideAfterTransitionId = ref<number | null>(null)
  const onWindowShow = vi.fn(async () => {
    await Promise.resolve()
  })
  const onWindowHide = vi.fn()
  const clearLivePreview = vi.fn()
  const windowModel = ref(false)

  registerProjectStylingWindowModelWatch({
    clearLivePreview,
    hideAfterTransitionId,
    onWindowHide,
    onWindowShow,
    windowModel
  })

  windowModel.value = true
  await flushPromises()

  windowModel.value = false
  await flushPromises()
  expect(onWindowHide).not.toHaveBeenCalled()

  windowModel.value = true
  await flushPromises()
  expect(hideAfterTransitionId.value).toBe(null)

  vi.advanceTimersByTime(FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS + 50)
  expect(onWindowHide).not.toHaveBeenCalled()
})

test('registerProjectStylingUnmount clears timers, refreshes KV, and runs hard-hide cleanup', async () => {
  setActivePinia(createPinia())
  const hideAfterTransitionId = ref<number | null>(null)

  const tid = window.setTimeout(() => {
    //
  }, 4000)

  hideAfterTransitionId.value = tid

  const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')

  const clearSpy = vi
    .spyOn(stylingSide, 'clearProjectStylingLivePreviewAndRefreshFromKv')
    .mockImplementation(() => {})
  const onHardHide = vi.fn()
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      registerProjectStylingUnmount({
        hideAfterTransitionId,
        onHardHide,
        windowModel
      })

      return () => null
    }
  })

  const wrapper = mount(Harness)

  wrapper.unmount()
  expect(clearTimeoutSpy).toHaveBeenCalledWith(tid)
  expect(hideAfterTransitionId.value).toBe(null)
  expect(clearSpy).toHaveBeenCalledWith(windowModel)
  expect(onHardHide).toHaveBeenCalledTimes(1)
})

test('registerProjectStylingActiveProjectWatch closes the window after a genuine project-id switch while open', async () => {
  setActivePinia(createPinia())

  const styling = S_FaProjectStyling()
  const refreshKvSpy = vi.spyOn(styling, 'refreshProjectStyling').mockResolvedValue(true)

  const windowModel = ref(true)

  registerProjectStylingActiveProjectWatch(windowModel)

  const active = S_FaActiveProject()

  active.setActiveProject({
    filePath: 'C:\\a\\a.faproject',
    id: 'id-a',
    name: 'A'
  })

  await nextTick()

  active.setActiveProject({
    filePath: 'C:\\b\\b.faproject',
    id: 'id-b',
    name: 'B'
  })

  await nextTick()

  await flushPromises()

  expect(windowModel.value).toBe(false)
  expect(refreshKvSpy).toHaveBeenCalled()
  expect(styling.cssLivePreview).toBe(null)
})

test('registerProjectStylingActiveProjectWatch stays idle while the window is hidden', async () => {
  setActivePinia(createPinia())

  const styling = S_FaProjectStyling()

  const refreshKvSpy = vi.spyOn(styling, 'refreshProjectStyling').mockResolvedValue(true)

  registerProjectStylingActiveProjectWatch(ref(false))

  const active = S_FaActiveProject()

  active.setActiveProject({
    filePath: 'C:\\a\\a.faproject',
    id: 'id-a',
    name: 'A'
  })

  active.setActiveProject({
    filePath: 'C:\\b\\b.faproject',
    id: 'id-b',
    name: 'B'
  })

  await nextTick()
  await flushPromises()

  expect(refreshKvSpy).not.toHaveBeenCalled()
})
