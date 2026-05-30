import {
  expect,
  test,
  vi
} from 'vitest'
import { nextTick, ref, shallowRef } from 'vue'

import type { I_FaMonacoMount } from 'app/types/I_faWindowStylingMonaco'

import {
  reconcileMountedMonacoWithWorkingCss,
  wireAppStylingPersistedCssIntoOpenEditor
} from '../windowAppStyling_manager'

/**
 * wireAppStylingPersistedCssIntoOpenEditor
 * Ignores persisted CSS updates while the floating window stays closed so external writes do not touch the dormant working buffer.
 */
test('persisted-css wire skips syncing when windowModel is closed', async () => {
  const persistedCssRef = ref('a{}')
  const windowModel = ref(false)
  const workingCss = ref('idle')
  const monaco: Pick<I_FaMonacoMount, 'editor'> = {
    editor: shallowRef(null)
  }

  wireAppStylingPersistedCssIntoOpenEditor({
    getPersistedCss: (): string => persistedCssRef.value,
    monaco: monaco as unknown as I_FaMonacoMount,
    windowModel,
    workingCss
  })

  persistedCssRef.value = 'b{}'
  await nextTick()

  expect(workingCss.value).toBe('idle')
})

/**
 * wireAppStylingPersistedCssIntoOpenEditor
 * When the Monaco instance is absent, still copies persisted CSS into the working ref without throwing.
 */
test('persisted-css wire updates workingCss without an editor mounted', async () => {
  const persistedCssRef = ref('seed')
  const windowModel = ref(true)
  const workingCss = ref('seed')
  const monaco: Pick<I_FaMonacoMount, 'editor'> = {
    editor: shallowRef(null)
  }

  wireAppStylingPersistedCssIntoOpenEditor({
    getPersistedCss: (): string => persistedCssRef.value,
    monaco: monaco as unknown as I_FaMonacoMount,
    windowModel,
    workingCss
  })

  persistedCssRef.value = 'applied'
  await nextTick()

  expect(workingCss.value).toBe('applied')
})

/**
 * wireAppStylingPersistedCssIntoOpenEditor
 * Pushes persisted CSS through setValue on the Monaco editor while the floating window stays open whenever the refs diverge from the persisted snapshot.
 */
test('persisted-css wire forwards store css into Monaco setValue while open', async () => {
  const persistedCssRef = ref('phase-a')
  const windowModel = ref(true)
  const workingCss = ref('phase-a')
  const setValue = vi.fn()
  const stubEditor = shallowRef({
    getValue: (): string => 'phase-a',
    setValue
  })

  wireAppStylingPersistedCssIntoOpenEditor({
    getPersistedCss: (): string => persistedCssRef.value,
    monaco: { editor: stubEditor } as unknown as I_FaMonacoMount,
    windowModel,
    workingCss
  })

  persistedCssRef.value = 'phase-b'
  await nextTick()

  expect(workingCss.value).toBe('phase-b')
  expect(setValue).toHaveBeenCalledWith('phase-b')
})

/**
 * wireAppStylingPersistedCssIntoOpenEditor
 * Keeps Monaco quiet when persisted already equals the buffered copy before the watcher mutates the editor wrapper.
 */
test('persisted-css wire skips when persisted matches workingCss ahead of watcher', async () => {
  const persistedCssRef = ref('tick-a')
  const windowModel = ref(true)
  const workingCss = ref('tick-a')
  const setValue = vi.fn()
  const stubEditor = shallowRef({
    getValue: (): string => 'tick-a',
    setValue
  })

  wireAppStylingPersistedCssIntoOpenEditor({
    getPersistedCss: (): string => persistedCssRef.value,
    monaco: { editor: stubEditor } as unknown as I_FaMonacoMount,
    windowModel,
    workingCss
  })

  persistedCssRef.value = 'tick-b'
  await nextTick()
  expect(setValue).toHaveBeenCalledTimes(1)

  workingCss.value = 'tick-c'
  persistedCssRef.value = 'tick-c'
  await nextTick()

  expect(workingCss.value).toBe('tick-c')
  expect(setValue).toHaveBeenCalledTimes(1)
})

/**
 * reconcileMountedMonacoWithWorkingCss
 * Leaves the stub alone when Monaco has no active editor wrapper.
 */
test('monaco reconcile ignores null editor refs', () => {
  reconcileMountedMonacoWithWorkingCss({
    editor: null,
    workingCss: 'anything'
  })
})

/**
 * reconcileMountedMonacoWithWorkingCss
 * Calls setValue with workingCss whenever the Monaco buffer still holds an older string.
 */
test('monaco reconcile pushes workingCss when editor differs', () => {
  const setValueSpy = vi.fn()
  const stubEditor = shallowRef({
    getValue: (): string => 'ghost',
    setValue: setValueSpy
  })

  reconcileMountedMonacoWithWorkingCss({
    editor: stubEditor.value,
    workingCss: 'wanted'
  })

  expect(setValueSpy).toHaveBeenCalledWith('wanted')
})

/**
 * reconcileMountedMonacoWithWorkingCss
 * Skips pushing into Monaco when editor text already mirrors workingCss so setValue spam does not overwrite selection state.
 */
test('monaco reconcile skips setValue when text already matches workingCss', () => {
  const setValueSpy = vi.fn()
  const same = ':root{color:red}'
  const stubEditor = shallowRef({
    getValue: (): string => same,
    setValue: setValueSpy
  })

  reconcileMountedMonacoWithWorkingCss({
    editor: stubEditor.value,
    workingCss: same
  })

  expect(setValueSpy).not.toHaveBeenCalled()
})
