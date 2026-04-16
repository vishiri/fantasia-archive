import { expect, test, vi } from 'vitest'

import { dispatchFaExternalLinkMouseEvent } from '../faExternalLinkMouseDispatch'

const { checkIfExternalMock, openExternalMock } = vi.hoisted(() => {
  return {
    checkIfExternalMock: vi.fn(),
    openExternalMock: vi.fn()
  }
})

function buildMouseEvent (target: unknown, type: string): MouseEvent {
  return {
    preventDefault: vi.fn(),
    target,
    type
  } as unknown as MouseEvent
}

/**
 * dispatchFaExternalLinkMouseEvent
 * No-op when event target is null.
 */
test('Test that dispatch returns when target is null', () => {
  const getWin = vi.fn((): Window | undefined => {
    return undefined
  })
  dispatchFaExternalLinkMouseEvent(buildMouseEvent(null, 'click'), getWin)
  expect(getWin).not.toHaveBeenCalled()
})

/**
 * dispatchFaExternalLinkMouseEvent
 * No-op when there is no enclosing anchor.
 */
test('Test that dispatch returns when closest finds no anchor', () => {
  const getWin = vi.fn((): Window | undefined => {
    return undefined
  })
  dispatchFaExternalLinkMouseEvent(buildMouseEvent({
    closest: vi.fn(() => null),
    tagName: 'SPAN'
  }, 'click'), getWin)
  expect(getWin).not.toHaveBeenCalled()
})

/**
 * dispatchFaExternalLinkMouseEvent
 * No-op when faExternalLinksManager is missing on the window stub.
 */
test('Test that dispatch returns when manager is missing', () => {
  const stubWin = {
    faContentBridgeAPIs: {}
  } as unknown as Window
  const ev = buildMouseEvent({
    closest: vi.fn(() => null),
    href: 'https://example.com/',
    tagName: 'a'
  }, 'click')
  dispatchFaExternalLinkMouseEvent(ev, () => {
    return stubWin
  })
  expect(ev.preventDefault).not.toHaveBeenCalled()
})

/**
 * dispatchFaExternalLinkMouseEvent
 * No-op when checkIfExternal is not a function.
 */
test('Test that dispatch returns when checkIfExternal is invalid', () => {
  const stubWin = {
    faContentBridgeAPIs: {
      faExternalLinksManager: {
        checkIfExternal: 'bad',
        openExternal: openExternalMock
      }
    }
  } as unknown as Window
  const ev = buildMouseEvent({
    closest: vi.fn(() => null),
    href: 'https://example.com/',
    tagName: 'a'
  }, 'click')
  dispatchFaExternalLinkMouseEvent(ev, () => {
    return stubWin
  })
  expect(ev.preventDefault).not.toHaveBeenCalled()
})

/**
 * dispatchFaExternalLinkMouseEvent
 * No-op when openExternal is not a function.
 */
test('Test that dispatch returns when openExternal is invalid', () => {
  const stubWin = {
    faContentBridgeAPIs: {
      faExternalLinksManager: {
        checkIfExternal: checkIfExternalMock,
        openExternal: 'bad'
      }
    }
  } as unknown as Window
  const ev = buildMouseEvent({
    closest: vi.fn(() => null),
    href: 'https://example.com/',
    tagName: 'a'
  }, 'click')
  dispatchFaExternalLinkMouseEvent(ev, () => {
    return stubWin
  })
  expect(ev.preventDefault).not.toHaveBeenCalled()
})

/**
 * dispatchFaExternalLinkMouseEvent
 * Primary click on external link prevents default and opens via bridge.
 */
test('Test that dispatch opens external https links', () => {
  checkIfExternalMock.mockReturnValueOnce(true)
  const stubWin = {
    faContentBridgeAPIs: {
      faExternalLinksManager: {
        checkIfExternal: checkIfExternalMock,
        openExternal: openExternalMock
      }
    }
  } as unknown as Window
  const ev = buildMouseEvent({
    closest: vi.fn(() => null),
    href: 'https://example.com/',
    tagName: 'a'
  }, 'click')
  dispatchFaExternalLinkMouseEvent(ev, () => {
    return stubWin
  })
  expect(ev.preventDefault).toHaveBeenCalledOnce()
  expect(openExternalMock).toHaveBeenCalledWith('https://example.com/')
})

/**
 * dispatchFaExternalLinkMouseEvent
 * Auxclick on internal link assigns location.href on the stub window.
 */
test('Test that dispatch sets location on internal auxclick', () => {
  checkIfExternalMock.mockReturnValue(false)
  const locationHref = { current: 'app://start' }
  const stubWin = {
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
  } as unknown as Window
  const ev = buildMouseEvent({
    closest: vi.fn(() => null),
    href: 'app://internal/doc',
    tagName: 'a'
  }, 'auxclick')
  dispatchFaExternalLinkMouseEvent(ev, () => {
    return stubWin
  })
  expect(ev.preventDefault).toHaveBeenCalledOnce()
  expect(locationHref.current).toBe('app://internal/doc')
})

/**
 * dispatchFaExternalLinkMouseEvent
 * Resolves href from a parent anchor when the click target is a child element.
 */
test('Test that dispatch uses closest anchor href for nested targets', () => {
  checkIfExternalMock.mockReturnValueOnce(true)
  const stubWin = {
    faContentBridgeAPIs: {
      faExternalLinksManager: {
        checkIfExternal: checkIfExternalMock,
        openExternal: openExternalMock
      }
    }
  } as unknown as Window
  const parent = {
    href: 'https://nested.example/page',
    tagName: 'a'
  }
  const ev = buildMouseEvent({
    closest: vi.fn(() => parent),
    tagName: 'SPAN'
  }, 'click')
  dispatchFaExternalLinkMouseEvent(ev, () => {
    return stubWin
  })
  expect(checkIfExternalMock).toHaveBeenCalledWith('https://nested.example/page')
  expect(openExternalMock).toHaveBeenCalledWith('https://nested.example/page')
})

/**
 * dispatchFaExternalLinkMouseEvent
 * Auxclick on external link prevents default twice and does not assign location.
 */
test('Test that dispatch handles external auxclick without location assign', () => {
  checkIfExternalMock.mockReturnValue(true)
  const locationHref = { current: 'app://start' }
  const stubWin = {
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
  } as unknown as Window
  const ev = buildMouseEvent({
    closest: vi.fn(() => null),
    href: 'https://example.com/ext',
    tagName: 'a'
  }, 'auxclick')
  dispatchFaExternalLinkMouseEvent(ev, () => {
    return stubWin
  })
  expect(ev.preventDefault).toHaveBeenCalledTimes(2)
  expect(locationHref.current).toBe('app://start')
})
