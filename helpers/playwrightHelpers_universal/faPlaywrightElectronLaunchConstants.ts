import appRoot from 'app-root-path'

import { FA_FRONTEND_RENDER_TIMER_MS } from 'app/src-electron/shared/faFrontendRenderTimerMs'

/**
 * Absolute path to unpackaged electron-main.js for Playwright 'electron.launch' args (Node test runner only).
 * Matches the historical 'app-root-path' + dist suffix used before sandboxed preload moved path resolution to main.
 */
export const FA_ELECTRON_MAIN_JS_PATH = `${appRoot}/dist/electron/UnPackaged/electron-main.js`

/**
 * Default post-launch wait (ms) before component test assertions; same value as main extra-env snapshot.
 */
export const FA_FRONTEND_RENDER_TIMER = FA_FRONTEND_RENDER_TIMER_MS
