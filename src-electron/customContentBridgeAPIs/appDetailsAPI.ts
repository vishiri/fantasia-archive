import { I_appDetailsAPI } from './../../interfaces/I_appDetailsAPI'

import { app } from '@electron/remote'

export const appDetailsAPI: I_appDetailsAPI = {
  PROJECT_VERSION: app.getVersion()
}
