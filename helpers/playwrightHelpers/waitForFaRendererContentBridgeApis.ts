import type { Page } from 'playwright'

/**
 * Component and E2E Playwright waits must not probe 'window.faContentBridgeAPIs' through
 * 'page.evaluate' or 'waitForFunction'. Those runners execute in Playwright isolated worlds where
 * Electron 'contextBridge.exposeInMainWorld' globals are invisible, even though the Quasar renderer
 * sees the bridge normally.
 */

const FA_RENDERER_COMPONENT_TESTING_ROUTE_TIMEOUT_MS = 30_000
const FA_E2E_SHELL_LOAD_TIMEOUT_MS = 30_000
const FA_RENDERER_ROUTE_POLL_MS = 100

/**
 * Resolves once the Electron renderer navigates to the component-testing shell (routing after preload IPC).
 */
export async function waitForFaRendererContentBridgeApis (appWindow: Page): Promise<void> {
  const deadlineMs = Date.now() + FA_RENDERER_COMPONENT_TESTING_ROUTE_TIMEOUT_MS

  while (Date.now() < deadlineMs) {
    if (/componentTesting\//.test(appWindow.url())) {
      return
    }

    await appWindow.waitForTimeout(FA_RENDERER_ROUTE_POLL_MS)
  }

  throw new Error('Timed out waiting for component-testing route.')
}

/**
 * E2E runs stay on '#/' startup routes. Wait only for DOM readiness.
 */
export async function waitForFaE2eRendererDomReady (appWindow: Page): Promise<void> {
  await appWindow.waitForLoadState('domcontentloaded', {
    timeout: FA_E2E_SHELL_LOAD_TIMEOUT_MS
  })
}
