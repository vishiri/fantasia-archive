/* eslint-disable vue/one-component-per-file -- colocated defineComponent harnesses for composable tests */

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
  resolveDialogKeybindSettingsBodySectionHTMLElement,
  useDialogKeybindSettingsTableChrome,
  useDialogKeybindSettingsTableLayout
} from '../dialogKeybindSettingsTableLayoutObserve'

let resizeObserverOriginal: typeof ResizeObserver | undefined

beforeEach(() => {
  vi.restoreAllMocks()
})

/**
 * resolveDialogKeybindSettingsBodySectionHTMLElement
 * Returns null when the component instance is missing.
 */
test('resolveDialogKeybindSettingsBodySectionHTMLElement returns null without an instance', () => {
  expect(resolveDialogKeybindSettingsBodySectionHTMLElement(null)).toBe(null)
})

/**
 * resolveDialogKeybindSettingsBodySectionHTMLElement
 * Returns null when $el is not an HTMLElement.
 */
test('resolveDialogKeybindSettingsBodySectionHTMLElement rejects non-element $el values', () => {
  expect(
    resolveDialogKeybindSettingsBodySectionHTMLElement({
      $el: document.createTextNode('x')
    } as never)
  ).toBe(null)
  expect(
    resolveDialogKeybindSettingsBodySectionHTMLElement({
      $el: null
    } as never)
  ).toBe(null)
  expect(
    resolveDialogKeybindSettingsBodySectionHTMLElement({} as never)
  ).toBe(null)
})

/**
 * resolveDialogKeybindSettingsBodySectionHTMLElement
 * Returns the element when $el is an HTMLElement.
 */
test('resolveDialogKeybindSettingsBodySectionHTMLElement returns HTMLElement roots', () => {
  const el = document.createElement('div')
  expect(
    resolveDialogKeybindSettingsBodySectionHTMLElement({
      $el: el
    } as never)
  ).toBe(el)
})

afterEach(() => {
  if (resizeObserverOriginal) {
    globalThis.ResizeObserver = resizeObserverOriginal
    resizeObserverOriginal = undefined
  }
  vi.restoreAllMocks()
})

/**
 * useDialogKeybindSettingsTableLayout
 * When the section element is missing at observe time, no ResizeObserver attaches.
 */
test('useDialogKeybindSettingsTableLayout skips observe when the section element is null', async () => {
  const observe = vi.fn()
  class ResizeObserverStub {
    constructor (private readonly cb: ResizeObserverCallback) {
      void this.cb
    }

    observe = observe
    disconnect = vi.fn()
  }
  resizeObserverOriginal = globalThis.ResizeObserver
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver

  const dialogModel = ref(true)
  mount(
    defineComponent({
      setup () {
        useDialogKeybindSettingsTableLayout({
          dialogModel,
          getSectionElement: (): HTMLElement | null => null
        })
        return {}
      },
      template: '<div />'
    })
  )

  await flushPromises()
  await nextTick()
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })

  expect(observe).not.toHaveBeenCalled()
})

/**
 * useDialogKeybindSettingsTableLayout
 * Supersedes an in-flight open when the dialog model flips before layout delay finishes.
 */
test('useDialogKeybindSettingsTableLayout ignores stale open when generation advances', async () => {
  const observe = vi.fn()
  class ResizeObserverStub {
    constructor (private readonly cb: ResizeObserverCallback) {
      void this.cb
    }

    observe = observe
    disconnect = vi.fn()
  }
  resizeObserverOriginal = globalThis.ResizeObserver
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver

  const section = document.createElement('div')
  Object.defineProperty(
    section,
    'clientHeight',
    {
      configurable: true,
      value: 200
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
  const w = mount(
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

  dialogModel.value = true
  await flushPromises()
  await nextTick()
  dialogModel.value = false
  await flushPromises()
  await nextTick()
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

  expect(observe).toHaveBeenCalled()
  expect(w.vm.tableMaxHeightPx).toBe(200)
  w.unmount()
})

/**
 * useDialogKeybindSettingsTableLayout
 * Resize-driven measure tolerates a transient null section element.
 */
test('useDialogKeybindSettingsTableLayout measure no-ops when the section becomes null', async () => {
  const observeSpy = vi.fn()
  let emitResize: (() => void) | null = null
  resizeObserverOriginal = globalThis.ResizeObserver
  globalThis.ResizeObserver = class {
    private readonly callback: ResizeObserverCallback

    constructor (cb: ResizeObserverCallback) {
      this.callback = cb
    }

    observe = (): void => {
      observeSpy()
      emitResize = (): void => {
        this.callback(
          [],
          this as unknown as ResizeObserver
        )
      }
    }

    disconnect = vi.fn()
  } as unknown as typeof ResizeObserver

  const section = document.createElement('div')
  Object.defineProperty(
    section,
    'clientHeight',
    {
      configurable: true,
      value: 200
    }
  )
  vi.spyOn(
    window,
    'getComputedStyle'
  ).mockReturnValue({
    paddingBottom: '0px',
    paddingTop: '0px'
  } as unknown as CSSStyleDeclaration)

  let target: HTMLElement | null = section
  const dialogModel = ref(true)
  const w = mount(
    defineComponent({
      setup () {
        const { tableMaxHeightPx } = useDialogKeybindSettingsTableLayout({
          dialogModel,
          getSectionElement: (): HTMLElement | null => target
        })
        return { tableMaxHeightPx }
      },
      template: '<div />'
    })
  )

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

  expect(observeSpy).toHaveBeenCalled()
  expect(emitResize).not.toBe(null)
  target = null
  ;(emitResize as unknown as () => void)()
  expect(w.vm.tableMaxHeightPx).toBe(200)
  w.unmount()
})

/**
 * useDialogKeybindSettingsTableChrome
 * Layout wiring tolerates an open dialog before the body section ref exists.
 */
test('useDialogKeybindSettingsTableChrome skips layout observe when the body ref is still null', async () => {
  const observe = vi.fn()
  class ResizeObserverStub {
    constructor (private readonly cb: ResizeObserverCallback) {
      void this.cb
    }

    observe = observe
    disconnect = vi.fn()
  }
  resizeObserverOriginal = globalThis.ResizeObserver
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver

  const dialogModel = ref(true)
  mount(
    defineComponent({
      setup () {
        useDialogKeybindSettingsTableChrome(dialogModel)
        return {}
      },
      template: '<div />'
    })
  )

  await flushPromises()
  await nextTick()
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })

  expect(observe).not.toHaveBeenCalled()
})

/**
 * useDialogKeybindSettingsTableChrome
 * getSectionElement returns null when the body ref is unset.
 */
test('useDialogKeybindSettingsTableChrome style stays undefined until a height is known', () => {
  const dialogModel = ref(false)
  const w = mount(
    defineComponent({
      setup () {
        const chrome = useDialogKeybindSettingsTableChrome(dialogModel)
        return {
          dialogKeybindSettingsTableHeightStyle: chrome.dialogKeybindSettingsTableHeightStyle
        }
      },
      template: '<div />'
    })
  )

  expect(w.vm.dialogKeybindSettingsTableHeightStyle).toBeUndefined()
})

/**
 * useDialogKeybindSettingsTableChrome
 * Resolves a HTMLElement $el from the body section ref for measurement.
 */
test('useDialogKeybindSettingsTableChrome applies maxHeight when $el is an HTMLElement', async () => {
  const section = document.createElement('div')
  Object.defineProperty(
    section,
    'clientHeight',
    {
      configurable: true,
      value: 200
    }
  )
  vi.spyOn(
    window,
    'getComputedStyle'
  ).mockReturnValue({
    paddingBottom: '0px',
    paddingTop: '0px'
  } as unknown as CSSStyleDeclaration)

  const dialogModel = ref(true)
  const w = mount(
    defineComponent({
      setup () {
        const chrome = useDialogKeybindSettingsTableChrome(dialogModel)
        chrome.bodySectionRef.value = {
          $el: section
        } as never
        return {
          dialogKeybindSettingsTableHeightStyle: chrome.dialogKeybindSettingsTableHeightStyle
        }
      },
      template: '<div />'
    })
  )

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

  expect(w.vm.dialogKeybindSettingsTableHeightStyle).toEqual({
    maxHeight: '200px'
  })
  w.unmount()
})

/**
 * useDialogKeybindSettingsTableChrome
 * Missing $el is treated as no section for layout reads.
 */
test('useDialogKeybindSettingsTableChrome ignores instances without an element root', async () => {
  const observe = vi.fn()
  class ResizeObserverStub {
    constructor (private readonly cb: ResizeObserverCallback) {
      void this.cb
    }

    observe = observe
    disconnect = vi.fn()
  }
  resizeObserverOriginal = globalThis.ResizeObserver
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver

  const dialogModel = ref(true)
  const w = mount(
    defineComponent({
      setup () {
        const chrome = useDialogKeybindSettingsTableChrome(dialogModel)
        chrome.bodySectionRef.value = {} as never
        return {}
      },
      template: '<div />'
    })
  )

  await flushPromises()
  await nextTick()
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })

  expect(observe).not.toHaveBeenCalled()
  w.unmount()
})

/**
 * useDialogKeybindSettingsTableChrome
 * Null $el is treated as no section for layout reads.
 */
test('useDialogKeybindSettingsTableChrome ignores null element roots', async () => {
  const observe = vi.fn()
  class ResizeObserverStub {
    constructor (private readonly cb: ResizeObserverCallback) {
      void this.cb
    }

    observe = observe
    disconnect = vi.fn()
  }
  resizeObserverOriginal = globalThis.ResizeObserver
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver

  const dialogModel = ref(true)
  const w = mount(
    defineComponent({
      setup () {
        const chrome = useDialogKeybindSettingsTableChrome(dialogModel)
        chrome.bodySectionRef.value = {
          $el: null
        } as never
        return {}
      },
      template: '<div />'
    })
  )

  await flushPromises()
  await nextTick()
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })

  expect(observe).not.toHaveBeenCalled()
  w.unmount()
})

/**
 * useDialogKeybindSettingsTableChrome
 * Non-HTMLElement $el is treated as no section for layout reads.
 */
test('useDialogKeybindSettingsTableChrome ignores non-element component roots', async () => {
  const observe = vi.fn()
  class ResizeObserverStub {
    constructor (private readonly cb: ResizeObserverCallback) {
      void this.cb
    }

    observe = observe
    disconnect = vi.fn()
  }
  resizeObserverOriginal = globalThis.ResizeObserver
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver

  const dialogModel = ref(true)
  const w = mount(
    defineComponent({
      setup () {
        const chrome = useDialogKeybindSettingsTableChrome(dialogModel)
        chrome.bodySectionRef.value = {
          $el: document.createTextNode('x')
        } as never
        return {}
      },
      template: '<div />'
    })
  )

  await flushPromises()
  await nextTick()
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })

  expect(observe).not.toHaveBeenCalled()
  w.unmount()
})
