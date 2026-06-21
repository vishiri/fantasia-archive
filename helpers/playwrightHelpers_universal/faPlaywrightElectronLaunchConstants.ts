import appRoot from 'app-root-path'

import { FA_FRONTEND_RENDER_TIMER_MS } from 'app/src-electron/shared/faFrontendRenderTimerMs'
import { FA_Q_TOOLTIP_DELAY_MS } from 'app/src/scripts/appGlobalManagementUI/faQTooltipDelay_manager'

/**
 * Absolute path to unpackaged electron-main.js for Playwright 'electron.launch' args (Node test runner only).
 * Matches the historical 'app-root-path' + dist suffix used before sandboxed preload moved path resolution to main.
 */
export const FA_ELECTRON_MAIN_JS_PATH = `${appRoot}/dist/electron/UnPackaged/electron-main.js`

/**
 * Default post-launch wait (ms) before component test assertions; same value as main extra-env snapshot.
 */
export const FA_FRONTEND_RENDER_TIMER = FA_FRONTEND_RENDER_TIMER_MS

/**
 * Post-hover wait (ms) before asserting a live Quasar q-tooltip under Electron.
 * Default open delay plus slack for layout paint and portaled tooltip mount.
 */
export const FA_PLAYWRIGHT_Q_TOOLTIP_OPEN_SETTLE_MS = FA_Q_TOOLTIP_DELAY_MS + 900
