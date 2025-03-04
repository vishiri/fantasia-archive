import { I_extraEnvVariablesAPI } from 'app/types/I_extraEnvVariablesAPI'
import appRoot from 'app-root-path'

// Extra variables for the app window (mostly used by component/E2E testing)
export const extraEnvVariablesAPI: I_extraEnvVariablesAPI = {
  ELECTRON_MAIN_FILEPATH: appRoot + '/dist/electron/UnPackaged/electron-main.js',
  FA_FRONTEND_RENDER_TIMER: 3000,
  TEST_ENV: (process.env.TEST_ENV)
    ? process.env.TEST_ENV
    : false,
  COMPONENT_NAME: (process.env.COMPONENT_NAME)
    ? process.env.COMPONENT_NAME
    : false,
  COMPONENT_PROPS: (process.env.COMPONENT_PROPS)
    ? JSON.parse(process.env.COMPONENT_PROPS)
    : false
}
