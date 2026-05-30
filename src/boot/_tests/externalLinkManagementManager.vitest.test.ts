/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'

import {
  handleFaExternalLinkMouseEvent,
  runExternalLinkManagementBoot
} from '../scripts/externalLinkManagement_manager'

/**
 * runExternalLinkManagementBoot (manager export)
 * Registers click and auxclick listeners on document.
 */
test('Test that runExternalLinkManagementBoot registers listeners via the manager wiring', () => {
  const addEventListenerMock = vi.fn()
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    writable: true,
    value: { addEventListener: addEventListenerMock } as unknown as Document
  })

  runExternalLinkManagementBoot()

  expect(addEventListenerMock).toHaveBeenCalledWith('click', expect.any(Function))
  expect(addEventListenerMock).toHaveBeenCalledWith('auxclick', expect.any(Function))
})

/**
 * getBrowserWindowForFaExternalLinks
 * Returns undefined when globalThis.window is missing so dispatch stays a no-op.
 */
test('Test that getBrowserWindowForFaExternalLinks returns undefined without global window', async () => {
  const priorWindow = globalThis.window
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: undefined
  })

  const { getBrowserWindowForFaExternalLinks } = await import('../scripts/functions/faExternalLinkGetBrowserWindow')
  expect(getBrowserWindowForFaExternalLinks()).toBeUndefined()

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: priorWindow
  })
})

/**
 * handleFaExternalLinkMouseEvent (manager export)
 * External click opens through the bridge when window and manager APIs exist.
 */
test('Test that manager handleFaExternalLinkMouseEvent opens external links', () => {
  const checkIfExternalMock = vi.fn(() => true)
  const openExternalMock = vi.fn()
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: {
      faContentBridgeAPIs: {
        faExternalLinksManager: {
          checkIfExternal: checkIfExternalMock,
          openExternal: openExternalMock
        }
      }
    } as unknown as Window & typeof globalThis
  })

  const targetAnchor = {
    tagName: 'a',
    href: 'https://example.com/',
    closest: vi.fn(() => null)
  }

  const preventDefaultMock = vi.fn()

  handleFaExternalLinkMouseEvent({
    target: targetAnchor,
    type: 'click',
    preventDefault: preventDefaultMock
  } as unknown as MouseEvent)

  expect(checkIfExternalMock).toHaveBeenCalledWith('https://example.com/')
  expect(preventDefaultMock).toHaveBeenCalledOnce()
  expect(openExternalMock).toHaveBeenCalledWith('https://example.com/')
})

/**
 * handleFaExternalLinkMouseEvent (manager export)
 * Auxclick on an internal link does not assign location when the browser window is unavailable.
 */
test('Test that manager handleFaExternalLinkMouseEvent skips internal auxclick without window', () => {
  const priorWindow = globalThis.window
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: undefined
  })

  const targetAnchor = {
    tagName: 'A',
    href: 'app://internal/page',
    closest: vi.fn(() => null)
  }

  const preventDefaultMock = vi.fn()

  handleFaExternalLinkMouseEvent({
    target: targetAnchor,
    type: 'auxclick',
    preventDefault: preventDefaultMock
  } as unknown as MouseEvent)

  expect(preventDefaultMock).not.toHaveBeenCalled()

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: priorWindow
  })
})
