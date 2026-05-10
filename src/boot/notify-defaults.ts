import 'app/types/faQuasarNotifyAugmentation'
import { Notify } from 'quasar'

import { installFaNotifyConsoleLogging } from 'app/src/scripts/appGlobalManagementUI/faNotifyConsoleLogging'

installFaNotifyConsoleLogging(Notify)

Notify.setDefaults({
  position: 'bottom-right',
  progress: true,
  timeout: 4000
})
