import { expect, test, vi } from 'vitest'

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

import externalLinkManagerBoot from '../externalLinkManager'

function runExternalLinkBoot (): void {
  const run = externalLinkManagerBoot as () => void
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
 * externalLinkManager boot file
 * Test if click and auxclick listeners are registered.
 */
test('Test that externalLinkManager boot registers click handlers', () => {
  const addEventListenerMock = vi.fn()
  setDocumentAddListenerMock(addEventListenerMock)

  runExternalLinkBoot()

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
 * externalLinkManager auxclick handler
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
