import { afterEach, expect, test, vi } from 'vitest'

/**
 * resolveFaElectronMainJsPath
 * Uses 'process.argv[1]' when Electron passes the main script path.
 */
test('Test that resolveFaElectronMainJsPath returns argv[1] when non-empty', async () => {
  const originalArgv1 = process.argv[1]
  process.argv[1] = '/fake/unpackaged/electron-main.js'

  vi.resetModules()
  const { resolveFaElectronMainJsPath } = await import('../resolveFaElectronMainJsPath')

  expect(resolveFaElectronMainJsPath()).toBe('/fake/unpackaged/electron-main.js')

  process.argv[1] = originalArgv1
})

/**
 * resolveFaElectronMainJsPath
 * Empty 'argv[1]' falls back to this module absolute path (Vitest / non-Electron runners).
 */
test('Test that resolveFaElectronMainJsPath falls back when argv[1] is empty', async () => {
  const originalArgv1 = process.argv[1]
  process.argv[1] = ''

  vi.resetModules()
  const { resolveFaElectronMainJsPath } = await import('../resolveFaElectronMainJsPath')

  const resolved = resolveFaElectronMainJsPath()

  expect(resolved.length).toBeGreaterThan(0)
  expect(resolved).not.toBe('/fake/unpackaged/electron-main.js')

  process.argv[1] = originalArgv1
})

afterEach(() => {
  vi.resetModules()
})
