import { expect, test, vi } from 'vitest'

const {
  bootMock,
  checkIfExternalMock,
  openExternalMock
} = vi.hoisted(() => {
  const bootImplementation = vi.fn((callback: unknown) => callback)

  return {
    bootMock: bootImplementation,
    checkIfExternalMock: vi.fn(),
    openExternalMock: vi.fn()
  }
})

vi.mock('quasar/wrappers', () => {
  return {
    boot: bootMock
  }
})

import externalLinkManagerBootFunction from '../externalLinkManager'

/**
 * externalLinkManager boot file
 * Test if click and auxclick listeners are registered.
 */
test('Test that externalLinkManager boot registers click handlers', () => {
  const addEventListenerMock = vi.fn()
  ;(globalThis as typeof globalThis & { document: { addEventListener: typeof addEventListenerMock } }).document = {
    addEventListener: addEventListenerMock
  }

  externalLinkManagerBootFunction()

  expect(addEventListenerMock).toHaveBeenCalledWith('click', expect.any(Function))
  expect(addEventListenerMock).toHaveBeenCalledWith('auxclick', expect.any(Function))
})

/**
 * externalLinkManager click handler
 * Test that external links are intercepted and opened through bridge API.
 */
test('Test that click handler opens external links via faExternalLinksManager', () => {
  const eventHandlers: Record<string, (ev: Event) => void> = {}
  const addEventListenerMock = vi.fn((type: string, listener: unknown) => {
    eventHandlers[type] = listener as (ev: Event) => void
  })
  ;(globalThis as typeof globalThis & { document: { addEventListener: typeof addEventListenerMock } }).document = {
    addEventListener: addEventListenerMock
  }

  externalLinkManagerBootFunction()

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

  ;(globalThis as typeof globalThis & {
    window: {
      faContentBridgeAPIs: {
        faExternalLinksManager: {
          checkIfExternal: typeof checkIfExternalMock
          openExternal: typeof openExternalMock
        }
      }
      location: { href: string }
    }
  }).window = {
    faContentBridgeAPIs: {
      faExternalLinksManager: {
        checkIfExternal: checkIfExternalMock,
        openExternal: openExternalMock
      }
    },
    location: { href: '' }
  }

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
 * externalLinkManager auxclick handler
 * Test that middle-click prevents browser defaults.
 */
test('Test that auxclick prevents default behavior', () => {
  const eventHandlers: Record<string, (ev: Event) => void> = {}
  const addEventListenerMock = vi.fn((type: string, listener: unknown) => {
    eventHandlers[type] = listener as (ev: Event) => void
  })
  ;(globalThis as typeof globalThis & { document: { addEventListener: typeof addEventListenerMock } }).document = {
    addEventListener: addEventListenerMock
  }

  externalLinkManagerBootFunction()

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

  ;(globalThis as typeof globalThis & {
    window: {
      faContentBridgeAPIs: {
        faExternalLinksManager: {
          checkIfExternal: typeof checkIfExternalMock
          openExternal: typeof openExternalMock
        }
      }
      location: { href: string }
    }
  }).window = {
    faContentBridgeAPIs: {
      faExternalLinksManager: {
        checkIfExternal: checkIfExternalMock,
        openExternal: openExternalMock
      }
    },
    location: { href: '' }
  }

  eventHandlers.auxclick({
    target: targetAnchor,
    type: 'auxclick',
    preventDefault: preventDefaultMock
  } as unknown as Event)

  expect(preventDefaultMock).toHaveBeenCalledTimes(2)
})
