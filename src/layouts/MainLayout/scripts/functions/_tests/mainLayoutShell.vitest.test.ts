import { expect, test } from 'vitest'

import { resolveMainLayoutOutletKey } from '../mainLayoutOutletKey'
import {
  resolveMainLayoutRouteClass,
  resolveMainLayoutShowWorkspaceDrawer
} from '../mainLayoutWorkspaceShell'

/**
 * resolveMainLayoutOutletKey
 * Falls back when nested route path is not ready.
 */
test('Test that resolveMainLayoutOutletKey uses fallback without path', () => {
  expect(resolveMainLayoutOutletKey(undefined)).toBe('app-shell-outlet')
})

/**
 * resolveMainLayoutShowWorkspaceDrawer
 * Drawer opens only on /home.
 */
test('Test that resolveMainLayoutShowWorkspaceDrawer is true on workspace route', () => {
  expect(resolveMainLayoutShowWorkspaceDrawer('/home')).toBe(true)
  expect(resolveMainLayoutShowWorkspaceDrawer('/')).toBe(false)
})

/**
 * resolveMainLayoutRouteClass
 * Welcome vs workspace class map follows drawer visibility.
 */
test('Test that resolveMainLayoutRouteClass maps welcome and workspace flags', () => {
  expect(resolveMainLayoutRouteClass(false)).toEqual({
    'appShellLayout--welcome': true,
    'appShellLayout--workspace': false
  })
})
