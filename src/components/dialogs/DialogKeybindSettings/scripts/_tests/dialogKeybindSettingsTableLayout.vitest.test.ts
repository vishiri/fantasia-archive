import { defineComponent, nextTick, ref } from 'vue'
import {
  flushPromises,
  mount
} from '@vue/test-utils'
import {
  afterEach,
  beforeEach,
  expect,
  test,
  vi
} from 'vitest'

import {
  computeDialogKeybindSettingsTableMaxHeightPx,
  DIALOG_KEYBIND_SETTINGS_TABLE_MIN_MAX_HEIGHT_PX,
  parseCssLengthPx,
  readVerticalPaddingPx,
  useDialogKeybindSettingsTableLayout
} from '../dialogKeybindSettingsTableLayout'

beforeEach(() => {
  vi.restoreAllMocks()
})

let resizeObserverOriginal: typeof ResizeObserver | undefined

afterEach(() => {
  if (resizeObserverOriginal) {
    globalThis.ResizeObserver = resizeObserverOriginal
    resizeObserverOriginal = undefined
  }
  vi.restoreAllMocks()
})

/**
 * parseCssLengthPx
 * Parses numeric prefix from CSS lengths.
 */
test('parseCssLengthPx returns 0 for non-finite values', () => {
  expect(parseCssLengthPx('12px')).toBe(12)
  expect(parseCssLengthPx('not-a-number')).toBe(0)
})

/**
 * readVerticalPaddingPx
 * Sums padding-top and padding-bottom from computed style.
 */
test('readVerticalPaddingPx sums vertical padding from getComputedStyle', () => {
  const el = document.createElement('div')
  vi.spyOn(
    window,
    'getComputedStyle'
  ).mockReturnValue({
    paddingBottom: '4px',
    paddingTop: '6px'
  } as unknown as CSSStyleDeclaration)
  expect(readVerticalPaddingPx(el)).toBe(10)
})

/**
 * computeDialogKeybindSettingsTableMaxHeightPx
 * Floors client height minus padding and clamps to the minimum.
 */
test('computeDialogKeybindSettingsTableMaxHeightPx clamps to the configured minimum', () => {
  const el = document.createElement('div')
  vi.spyOn(
    window,
    'getComputedStyle'
  ).mockReturnValue({
    paddingBottom: '0px',
    paddingTop: '0px'
  } as unknown as CSSStyleDeclaration)
  Object.defineProperty(
    el,
    'clientHeight',
    {
      configurable: true,
      value: 40
    }
  )
  expect(computeDialogKeybindSettingsTableMaxHeightPx(el)).toBe(
    DIALOG_KEYBIND_SETTINGS_TABLE_MIN_MAX_HEIGHT_PX
  )
})

/**
 * computeDialogKeybindSettingsTableMaxHeightPx
 * Uses client height minus vertical padding when above the minimum.
 */
test('computeDialogKeybindSettingsTableMaxHeightPx subtracts vertical padding from client height', () => {
  const el = document.createElement('div')
  vi.spyOn(
    window,
    'getComputedStyle'
  ).mockReturnValue({
    paddingBottom: '8px',
    paddingTop: '12px'
  } as unknown as CSSStyleDeclaration)
  Object.defineProperty(
    el,
    'clientHeight',
    {
      configurable: true,
      value: 500
    }
  )
  expect(computeDialogKeybindSettingsTableMaxHeightPx(el)).toBe(480)
})

/**
 * useDialogKeybindSettingsTableLayout
 * Starts ResizeObserver and window resize when the dialog model opens.
 */
test('useDialogKeybindSettingsTableLayout measures after open and clears after close', async () => {
  const observe = vi.fn()
  const disconnect = vi.fn()
  class ResizeObserverStub {
    constructor (private readonly cb: ResizeObserverCallback) {
      void this.cb
    }

    observe = observe

    disconnect = disconnect
  }
  resizeObserverOriginal = globalThis.ResizeObserver
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
  const addSpy = vi.spyOn(
    window,
    'addEventListener'
  )
  const removeSpy = vi.spyOn(
    window,
    'removeEventListener'
  )

  const section = document.createElement('div')
  Object.defineProperty(
    section,
    'clientHeight',
    {
      configurable: true,
      value: 300
    }
  )
  vi.spyOn(
    window,
    'getComputedStyle'
  ).mockReturnValue({
    paddingBottom: '0px',
    paddingTop: '0px'
  } as unknown as CSSStyleDeclaration)

  const dialogModel = ref(false)
  const wrapper = mount(
    defineComponent({
      setup () {
        const { tableMaxHeightPx } = useDialogKeybindSettingsTableLayout({
          dialogModel,
          getSectionElement: (): HTMLElement | null => section
        })
        return { tableMaxHeightPx }
      },
      template: '<div />'
    })
  )

  expect(wrapper.vm.tableMaxHeightPx).toBe(null)

  dialogModel.value = true
  await flushPromises()
  await nextTick()
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })
  await flushPromises()

  expect(observe).toHaveBeenCalledWith(section)
  expect(addSpy).toHaveBeenCalledWith(
    'resize',
    expect.any(Function)
  )
  expect(wrapper.vm.tableMaxHeightPx).toBe(300)

  dialogModel.value = false
  await nextTick()
  expect(disconnect).toHaveBeenCalled()
  expect(removeSpy).toHaveBeenCalledWith(
    'resize',
    expect.any(Function)
  )
  expect(wrapper.vm.tableMaxHeightPx).toBe(null)

  wrapper.unmount()
})
