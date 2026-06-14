import throttle from 'lodash-es/throttle.js'
import { afterEach, expect, test, vi } from 'vitest'
import { onUnmounted, reactive, ref, watch } from 'vue'

import { FA_COLOR_PICKER_INPUT_PICKER_EMIT_THROTTLE_MS } from 'app/types/I_faColorPickerInput'
import { createFaColorPickerPopoverEmit } from '../functions/createFaColorPickerPopoverEmit'

const pickerEmitDeps = {
  onUnmounted,
  ref,
  throttle,
  throttleMs: FA_COLOR_PICKER_INPUT_PICKER_EMIT_THROTTLE_MS,
  watch
}

/**
 * createFaColorPickerPopoverEmit
 * Throttles picker-driven model sync while keeping a local draft for live UI.
 */
test('createFaColorPickerPopoverEmit throttles picker updates and flushes on change', () => {
  vi.useFakeTimers()

  const emitted: string[] = []
  const props = {
    modelValue: ''
  }

  const usePickerEmit = createFaColorPickerPopoverEmit(pickerEmitDeps)
  const pickerEmit = usePickerEmit(props, (value) => {
    emitted.push(value)
    props.modelValue = value
  })

  pickerEmit.onPickerUpdate('#111111')
  expect(emitted).toEqual(['#111111'])
  expect(pickerEmit.resolveLiveColorString()).toBe('#111111')

  pickerEmit.onPickerUpdate('#222222')
  expect(emitted).toEqual(['#111111'])
  expect(pickerEmit.resolveLiveColorString()).toBe('#222222')

  vi.advanceTimersByTime(FA_COLOR_PICKER_INPUT_PICKER_EMIT_THROTTLE_MS)
  expect(emitted).toEqual(['#111111', '#222222'])
  expect(props.modelValue).toBe('#222222')
  expect(pickerEmit.resolveLiveColorString()).toBe('#222222')

  pickerEmit.onPickerChange('#333333')
  expect(emitted).toEqual(['#111111', '#222222', '#333333'])
  expect(pickerEmit.resolveLiveColorString()).toBe('#333333')

  pickerEmit.onPickerUpdate(null)
  vi.advanceTimersByTime(FA_COLOR_PICKER_INPUT_PICKER_EMIT_THROTTLE_MS)
  pickerEmit.onPickerChange(null)
  expect(emitted.slice(-2)).toEqual(['', ''])
})

/**
 * createFaColorPickerPopoverEmit
 * Flushes pending picker sync when the menu closes.
 */
test('createFaColorPickerPopoverEmit flushes pending picker sync on menu hide', () => {
  vi.useFakeTimers()

  const emitted: string[] = []
  const props = reactive({
    modelValue: ''
  })

  const usePickerEmit = createFaColorPickerPopoverEmit(pickerEmitDeps)
  const pickerEmit = usePickerEmit(props, (value) => {
    emitted.push(value)
    props.modelValue = value
  })

  pickerEmit.onPickerUpdate('#111111')
  pickerEmit.onPickerUpdate('#aabbcc')
  expect(emitted).toEqual(['#111111'])

  pickerEmit.onPickerMenuHide()
  expect(emitted).toEqual(['#111111', '#aabbcc'])
  expect(props.modelValue).toBe('#aabbcc')
  expect(pickerEmit.resolveLiveColorString()).toBe('#aabbcc')
})

/**
 * createFaColorPickerPopoverEmit
 * Clears the local draft once the parent model catches up with a throttled emit.
 */
test('createFaColorPickerPopoverEmit clears draft when modelValue matches emitted draft', () => {
  vi.useFakeTimers()

  const props = reactive({
    modelValue: ''
  })

  const usePickerEmit = createFaColorPickerPopoverEmit(pickerEmitDeps)
  const pickerEmit = usePickerEmit(props, (value) => {
    props.modelValue = value
  })

  pickerEmit.onPickerUpdate('#111111')
  pickerEmit.onPickerUpdate('#445566')
  expect(pickerEmit.resolveLiveColorString()).toBe('#445566')

  vi.advanceTimersByTime(FA_COLOR_PICKER_INPUT_PICKER_EMIT_THROTTLE_MS)
  expect(props.modelValue).toBe('#445566')
  expect(pickerEmit.resolveLiveColorString()).toBe('#445566')
})

/**
 * createFaColorPickerPopoverEmit
 * Cancels pending throttled emits when the composable scope is torn down.
 */
test('createFaColorPickerPopoverEmit cancels throttled emit on teardown', () => {
  vi.useFakeTimers()

  const emitted: string[] = []
  const props = {
    modelValue: ''
  }
  const teardownCallbacks: Array<() => void> = []
  const deps = {
    ...pickerEmitDeps,
    onUnmounted: (fn: () => void) => {
      teardownCallbacks.push(fn)
    }
  }

  const usePickerEmit = createFaColorPickerPopoverEmit(deps)
  const pickerEmit = usePickerEmit(props, (value: string) => {
    emitted.push(value)
  })

  pickerEmit.onPickerUpdate('#111111')
  pickerEmit.onPickerUpdate('#222222')

  teardownCallbacks.forEach((fn) => {
    fn()
  })

  vi.advanceTimersByTime(FA_COLOR_PICKER_INPUT_PICKER_EMIT_THROTTLE_MS)
  expect(emitted).toEqual(['#111111'])
})

afterEach(() => {
  vi.useRealTimers()
})
