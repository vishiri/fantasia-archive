import { I_appDetailsAPI } from '../../types/I_appDetailsAPI'

import { app } from '@electron/remote'

export const appDetailsAPI: I_appDetailsAPI = {
  PROJECT_VERSION: app.getVersion()
}
