import { vi, expect, test } from 'vitest'

vi.mock('app-root-path', () => {
  return {
    default: '/mock/repo/root'
  }
})

/**
 * faPlaywrightElectronLaunchConstants
 * Main script path matches mocked app root and UnPackaged layout.
 */
test('Test that FA_ELECTRON_MAIN_JS_PATH uses app root and UnPackaged main script', async () => {
  const {
    FA_ELECTRON_MAIN_JS_PATH,
    FA_FRONTEND_RENDER_TIMER
  } = await import('../faPlaywrightElectronLaunchConstants')

  expect(FA_ELECTRON_MAIN_JS_PATH).toBe(
    '/mock/repo/root/dist/electron/UnPackaged/electron-main.js'
  )
  expect(FA_FRONTEND_RENDER_TIMER).toBe(3000)
})
