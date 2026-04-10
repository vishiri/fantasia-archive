import { ipcMain } from 'electron'

import { FA_EXTRA_ENV_IPC } from 'app/src-electron/electron-ipc-bridge'
import { resolveFaElectronMainJsPath } from 'app/src-electron/mainScripts/windowManagement/resolveFaElectronMainJsPath'
import { FA_FRONTEND_RENDER_TIMER_MS } from 'app/src-electron/shared/faFrontendRenderTimerMs'
import type { I_extraEnvVariablesAPI } from 'app/types/I_extraEnvVariablesAPI'

let registered = false

function optionalTruthyEnv (key: 'TEST_ENV' | 'COMPONENT_NAME'): string | false {
  const value = process.env[key]

  return value || false
}

function parseComponentProps (): I_extraEnvVariablesAPI['COMPONENT_PROPS'] {
  const raw = process.env.COMPONENT_PROPS

  if (!raw) {
    return false
  }

  return JSON.parse(raw) as Record<string, unknown>
}

function buildExtraEnvSnapshot (): I_extraEnvVariablesAPI {
  return {
    COMPONENT_NAME: optionalTruthyEnv('COMPONENT_NAME'),
    COMPONENT_PROPS: parseComponentProps(),
    ELECTRON_MAIN_FILEPATH: resolveFaElectronMainJsPath(),
    FA_FRONTEND_RENDER_TIMER: FA_FRONTEND_RENDER_TIMER_MS,
    TEST_ENV: optionalTruthyEnv('TEST_ENV')
  }
}

/**
 * Registers async IPC so sandboxed preload can read harness paths and env without Node filesystem APIs.
 * Safe to call once from 'startApp'; subsequent calls no-op.
 */
export function registerFaExtraEnvIpc (): void {
  if (registered) {
    return
  }

  registered = true

  ipcMain.handle(FA_EXTRA_ENV_IPC.snapshotAsync, () => {
    return buildExtraEnvSnapshot()
  })
}
