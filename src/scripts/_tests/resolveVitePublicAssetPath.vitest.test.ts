import { expect, test, vi } from 'vitest'

import { resolveVitePublicAssetPath } from '../resolveVitePublicAssetPath'

/**
 * resolveVitePublicAssetPath
 * Empty BASE_URL should yield a relative ./ prefix so file:// loads public assets.
 */
test('Test that resolveVitePublicAssetPath uses ./ when BASE_URL is an empty string', () => {
  vi.stubEnv('BASE_URL', '')
  expect(resolveVitePublicAssetPath('/countryFlags/us.svg')).toBe('./countryFlags/us.svg')
  expect(resolveVitePublicAssetPath('images/x.png')).toBe('./images/x.png')
  vi.unstubAllEnvs()
})

/**
 * resolveVitePublicAssetPath
 * Root slash BASE_URL should still normalize to ./ for the same file:// behavior.
 */
test('Test that resolveVitePublicAssetPath uses ./ when BASE_URL is a single slash', () => {
  vi.stubEnv('BASE_URL', '/')
  expect(resolveVitePublicAssetPath('/countryFlags/us.svg')).toBe('./countryFlags/us.svg')
  vi.unstubAllEnvs()
})

/**
 * resolveVitePublicAssetPath
 * Custom base with trailing slash joins without double slashes.
 */
test('Test that resolveVitePublicAssetPath joins a BASE_URL that already ends with a slash', () => {
  vi.stubEnv('BASE_URL', '/app/')
  expect(resolveVitePublicAssetPath('/countryFlags/de.svg')).toBe('/app/countryFlags/de.svg')
  vi.unstubAllEnvs()
})

/**
 * resolveVitePublicAssetPath
 * Custom base without trailing slash gets one inserted before the public path.
 */
test('Test that resolveVitePublicAssetPath inserts a slash when BASE_URL has no trailing slash', () => {
  vi.stubEnv('BASE_URL', '/app')
  expect(resolveVitePublicAssetPath('/countryFlags/fr.svg')).toBe('/app/countryFlags/fr.svg')
  vi.unstubAllEnvs()
})
