import { I_extraEnvVariablesAPI } from 'app/interfaces/I_extraEnvVariablesAPI'
import appRoot from 'app-root-path'
import { app } from '@electron/remote'

export const extraEnvVariablesAPI: I_extraEnvVariablesAPI = {
  PROJECT_VERSION: app.getVersion(),
  ELECTRON_MAIN_FILEPATH: appRoot + '/dist/electron/UnPackaged/electron-main.js',
  FA_FRONTEND_RENDER_TIMER: 3000,
  TEST_ENV: (process.env.TEST_ENV) ? process.env.TEST_ENV : false,
  COMPONENT_NAME: (process.env.COMPONENT_NAME) ? process.env.COMPONENT_NAME : false,
  COMPONENT_PROPS: (process.env.COMPONENT_PROPS) ? JSON.parse(process.env.COMPONENT_PROPS) : false
}
