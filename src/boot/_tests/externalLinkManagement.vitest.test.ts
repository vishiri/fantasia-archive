import { beforeEach, expect, test, vi } from 'vitest'

const {
  bootMock,
  checkIfExternalMock,
  openExternalMock
} = vi.hoisted(() => {
  const bootImplementation = vi.fn((callback: () => void) => callback)

  return {
    bootMock: bootImplementation,
    checkIfExternalMock: vi.fn(),
    openExternalMock: vi.fn()
  }
})

vi.mock('#q-app/wrappers', () => {
  return {
    defineBoot: bootMock
  }
})

import externalLinkManagementBoot from '../externalLinkManagement'

beforeEach(() => {
  checkIfExternalMock.mockReset()
  openExternalMock.mockReset()
})

function runExternalLinkBoot (): void {
  const run = externalLinkManagementBoot as () => void
  run()
}

function setDocumentAddListenerMock (addEventListenerMock: ReturnType<typeof vi.fn>): void {
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    writable: true,
    value: { addEventListener: addEventListenerMock } as unknown as Document
  })
}

function setWindowLinksStub (): void {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: {
      faContentBridgeAPIs: {
        faExternalLinksManager: {
          checkIfExternal: checkIfExternalMock,
          openExternal: openExternalMock
        }
      },
      location: { href: '' }
    } as unknown as Window & typeof globalThis
  })
}

/**
 * externalLinkManagement boot file
 * Test if click and auxclick listeners are registered.
 */
test('Test that externalLinkManagement boot registers click handlers', () => {
  const addEventListenerMock = vi.fn()
  setDocumentAddListenerMock(addEventListenerMock)

  runExternalLinkBoot()

  expect(addEventListenerMock).toHaveBeenCalledWith('click', expect.any(Function))
  expect(addEventListenerMock).toHaveBeenCalledWith('auxclick', expect.any(Function))
})

/**
 * externalLinkManagement click handler
 * Test that external links are intercepted and opened through bridge API.
 */
test('Test that click handler opens external links via faExternalLinksManager', () => {
  const eventHandlers: Record<string, (ev: Event) => void> = {}
  const addEventListenerMock = vi.fn((type: string, listener: unknown) => {
    eventHandlers[type] = listener as (ev: Event) => void
  })
  setDocumentAddListenerMock(addEventListenerMock)

  runExternalLinkBoot()

  const targetAnchor = {
    tagName: 'A',
    href: 'https://example.com/',
    closest: vi.fn(() => {
      return {
        href: 'https://example.com/'
      }
    })
  }

  const preventDefaultMock = vi.fn()
  checkIfExternalMock.mockReturnValueOnce(true)

  setWindowLinksStub()

  eventHandlers.click({
    target: targetAnchor,
    type: 'click',
    preventDefault: preventDefaultMock
  } as unknown as Event)

  expect(checkIfExternalMock).toHaveBeenCalledWith('https://example.com/')
  expect(preventDefaultMock).toHaveBeenCalledOnce()
  expect(openExternalMock).toHaveBeenCalledWith('https://example.com/')
})

/**
 * handleMouseClicks
 * Primary click on an internal link does not prevent default or delegate to openExternal.
 */
test('Test that click handler leaves internal links to normal navigation', () => {
  const eventHandlers: Record<string, (ev: Event) => void> = {}
  const addEventListenerMock = vi.fn((type: string, listener: unknown) => {
    eventHandlers[type] = listener as (ev: Event) => void
  })
  setDocumentAddListenerMock(addEventListenerMock)

  runExternalLinkBoot()

  const targetAnchor = {
    tagName: 'a',
    href: 'app://internal/page',
    closest: vi.fn(() => null)
  }

  const preventDefaultMock = vi.fn()
  checkIfExternalMock.mockReturnValue(false)

  setWindowLinksStub()

  eventHandlers.click({
    target: targetAnchor,
    type: 'click',
    preventDefault: preventDefaultMock
  } as unknown as Event)

  expect(checkIfExternalMock).toHaveBeenCalledWith('app://internal/page')
  expect(preventDefaultMock).not.toHaveBeenCalled()
  expect(openExternalMock).not.toHaveBeenCalled()
})

/**
 * externalLinkManagement auxclick handler
 * Test that middle-click prevents browser defaults.
 */
test('Test that auxclick prevents default behavior', () => {
  const eventHandlers: Record<string, (ev: Event) => void> = {}
  const addEventListenerMock = vi.fn((type: string, listener: unknown) => {
    eventHandlers[type] = listener as (ev: Event) => void
  })
  setDocumentAddListenerMock(addEventListenerMock)

  runExternalLinkBoot()

  const targetAnchor = {
    tagName: 'A',
    href: 'https://example.com/',
    closest: vi.fn(() => {
      return {
        href: 'https://example.com/'
      }
    })
  }

  const preventDefaultMock = vi.fn()
  checkIfExternalMock.mockReturnValueOnce(true)

  setWindowLinksStub()

  eventHandlers.auxclick({
    target: targetAnchor,
    type: 'auxclick',
    preventDefault: preventDefaultMock
  } as unknown as Event)

  expect(preventDefaultMock).toHaveBeenCalledTimes(2)
})

/**
 * externalLinkManagement auxclick handler
 * Internal links assign location.href after preventing default so middle-click follows in-window navigation.
 */
test('Test that auxclick on internal link sets location href when not external', () => {
  const eventHandlers: Record<string, (ev: Event) => void> = {}
  const addEventListenerMock = vi.fn((type: string, listener: unknown) => {
    eventHandlers[type] = listener as (ev: Event) => void
  })
  setDocumentAddListenerMock(addEventListenerMock)

  runExternalLinkBoot()

  const locationHref = { current: 'app://start' }
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: {
      faContentBridgeAPIs: {
        faExternalLinksManager: {
          checkIfExternal: checkIfExternalMock,
          openExternal: openExternalMock
        }
      },
      location: {
        set href (v: string) {
          locationHref.current = v
        },
        get href () {
          return locationHref.current
        }
      }
    } as unknown as Window & typeof globalThis
  })

  checkIfExternalMock.mockReset()
  checkIfExternalMock.mockReturnValue(false)
  openExternalMock.mockReset()

  const targetAnchor = {
    tagName: 'a',
    href: 'app://internal/doc',
    closest: vi.fn(() => null)
  }

  const preventDefaultMock = vi.fn()

  eventHandlers.auxclick({
    target: targetAnchor,
    type: 'auxclick',
    preventDefault: preventDefaultMock
  } as unknown as Event)

  expect(preventDefaultMock).toHaveBeenCalledTimes(1)
  expect(openExternalMock).not.toHaveBeenCalled()
  expect(locationHref.current).toBe('app://internal/doc')
})

/**
 * externalLinkManagement click handler
 * Ignores events whose target is null so shadow roots or detached nodes do not throw.
 */
test('Test that click handler returns early when event target is null', () => {
  const eventHandlers: Record<string, (ev: Event) => void> = {}
  const addEventListenerMock = vi.fn((type: string, listener: unknown) => {
    eventHandlers[type] = listener as (ev: Event) => void
  })
  setDocumentAddListenerMock(addEventListenerMock)

  runExternalLinkBoot()

  setWindowLinksStub()
  checkIfExternalMock.mockReset()
  checkIfExternalMock.mockReturnValue(false)

  const preventDefaultMock = vi.fn()

  eventHandlers.click({
    target: null,
    type: 'click',
    preventDefault: preventDefaultMock
  } as unknown as Event)

  expect(preventDefaultMock).not.toHaveBeenCalled()
  expect(checkIfExternalMock).not.toHaveBeenCalled()
})

/**
 * externalLinkManagement click handler
 * Resolves the anchor via closest when the direct target is not an anchor element.
 */
test('Test that click handler uses closest anchor when target is a nested element', () => {
  const eventHandlers: Record<string, (ev: Event) => void> = {}
  const addEventListenerMock = vi.fn((type: string, listener: unknown) => {
    eventHandlers[type] = listener as (ev: Event) => void
  })
  setDocumentAddListenerMock(addEventListenerMock)

  runExternalLinkBoot()

  const parentAnchor = {
    href: 'https://nested.example/page',
    tagName: 'A'
  }
  const innerSpan = {
    closest: vi.fn(() => parentAnchor),
    tagName: 'SPAN'
  }

  checkIfExternalMock.mockReset()
  checkIfExternalMock.mockReturnValue(true)
  openExternalMock.mockReset()
  setWindowLinksStub()

  const preventDefaultMock = vi.fn()

  eventHandlers.click({
    target: innerSpan,
    type: 'click',
    preventDefault: preventDefaultMock
  } as unknown as Event)

  expect(innerSpan.closest).toHaveBeenCalledWith('a')
  expect(checkIfExternalMock).toHaveBeenCalledWith('https://nested.example/page')
  expect(openExternalMock).toHaveBeenCalledWith('https://nested.example/page')
})

/**
 * externalLinkManagement click handler
 * Returns when closest does not find an enclosing anchor so non-link clicks are ignored.
 */
test('Test that click handler returns when nested target has no anchor ancestor', () => {
  const eventHandlers: Record<string, (ev: Event) => void> = {}
  const addEventListenerMock = vi.fn((type: string, listener: unknown) => {
    eventHandlers[type] = listener as (ev: Event) => void
  })
  setDocumentAddListenerMock(addEventListenerMock)

  runExternalLinkBoot()

  const orphanSpan = {
    closest: vi.fn(() => null),
    tagName: 'SPAN'
  }

  checkIfExternalMock.mockReset()
  setWindowLinksStub()

  eventHandlers.click({
    target: orphanSpan,
    type: 'click',
    preventDefault: vi.fn()
  } as unknown as Event)

  expect(orphanSpan.closest).toHaveBeenCalledWith('a')
  expect(checkIfExternalMock).not.toHaveBeenCalled()
})

/**
 * externalLinkManagement click handler
 * No-op when the content bridge omits faExternalLinksManager so non-Electron renders do not throw.
 */
test('Test that click handler returns when faExternalLinksManager is missing', () => {
  const eventHandlers: Record<string, (ev: Event) => void> = {}
  const addEventListenerMock = vi.fn((type: string, listener: unknown) => {
    eventHandlers[type] = listener as (ev: Event) => void
  })
  setDocumentAddListenerMock(addEventListenerMock)

  runExternalLinkBoot()

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: {
      faContentBridgeAPIs: {}
    } as unknown as Window & typeof globalThis
  })

  const targetAnchor = {
    tagName: 'A',
    href: 'https://example.com/',
    closest: vi.fn(() => null)
  }

  const preventDefaultMock = vi.fn()

  eventHandlers.click({
    target: targetAnchor,
    type: 'click',
    preventDefault: preventDefaultMock
  } as unknown as Event)

  expect(preventDefaultMock).not.toHaveBeenCalled()
})

/**
 * externalLinkManagement click handler
 * No-op when faExternalLinksManager exists but checkIfExternal is not a function.
 */
test('Test that click handler returns when checkIfExternal is not a function', () => {
  const eventHandlers: Record<string, (ev: Event) => void> = {}
  const addEventListenerMock = vi.fn((type: string, listener: unknown) => {
    eventHandlers[type] = listener as (ev: Event) => void
  })
  setDocumentAddListenerMock(addEventListenerMock)

  runExternalLinkBoot()

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: {
      faContentBridgeAPIs: {
        faExternalLinksManager: {
          checkIfExternal: 'not-a-fn',
          openExternal: openExternalMock
        }
      }
    } as unknown as Window & typeof globalThis
  })

  const targetAnchor = {
    tagName: 'A',
    href: 'https://example.com/',
    closest: vi.fn(() => null)
  }

  const preventDefaultMock = vi.fn()

  eventHandlers.click({
    target: targetAnchor,
    type: 'click',
    preventDefault: preventDefaultMock
  } as unknown as Event)

  expect(preventDefaultMock).not.toHaveBeenCalled()
})

/**
 * externalLinkManagement click handler
 * No-op when checkIfExternal is a function but openExternal is not.
 */
test('Test that click handler returns when openExternal is not a function', () => {
  const eventHandlers: Record<string, (ev: Event) => void> = {}
  const addEventListenerMock = vi.fn((type: string, listener: unknown) => {
    eventHandlers[type] = listener as (ev: Event) => void
  })
  setDocumentAddListenerMock(addEventListenerMock)

  runExternalLinkBoot()

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: {
      faContentBridgeAPIs: {
        faExternalLinksManager: {
          checkIfExternal: checkIfExternalMock,
          openExternal: 'not-a-fn'
        }
      }
    } as unknown as Window & typeof globalThis
  })

  const targetAnchor = {
    tagName: 'A',
    href: 'https://example.com/',
    closest: vi.fn(() => null)
  }

  const preventDefaultMock = vi.fn()

  eventHandlers.click({
    target: targetAnchor,
    type: 'click',
    preventDefault: preventDefaultMock
  } as unknown as Event)

  expect(preventDefaultMock).not.toHaveBeenCalled()
})
