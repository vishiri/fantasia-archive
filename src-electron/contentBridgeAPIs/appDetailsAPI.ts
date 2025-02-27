import { I_appDetailsAPI } from '../../types/I_appDetailsAPI'

import { app } from '@electron/remote'

// App details global variable used by the app window
export const appDetailsAPI: I_appDetailsAPI = {
  PROJECT_VERSION: app.getVersion()
}
