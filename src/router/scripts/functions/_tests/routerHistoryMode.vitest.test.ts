import { expect, test } from 'vitest'

import { resolveRouterHistoryMode } from '../routerHistoryMode'

/**
 * resolveRouterHistoryMode
 * SSR builds use memory history.
 */
test('Test that resolveRouterHistoryMode returns memory on server', () => {
  expect(resolveRouterHistoryMode(true, 'history')).toBe('memory')
})

/**
 * resolveRouterHistoryMode
 * Browser history mode follows VUE_ROUTER_MODE.
 */
test('Test that resolveRouterHistoryMode picks hash or history in the client', () => {
  expect(resolveRouterHistoryMode(false, 'history')).toBe('history')
  expect(resolveRouterHistoryMode(false, undefined)).toBe('hash')
})
