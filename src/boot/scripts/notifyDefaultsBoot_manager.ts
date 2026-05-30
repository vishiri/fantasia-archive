import 'app/types/faQuasarNotifyAugmentation'
import { Notify } from 'quasar'

import { installFaNotifyConsoleLogging } from 'app/src/scripts/appGlobalManagementUI/faNotifyConsoleLogging_manager'

import { createRunNotifyDefaultsBoot } from './functions/createRunNotifyDefaultsBoot'

export const runNotifyDefaultsBoot = createRunNotifyDefaultsBoot({
  Notify: Notify as unknown as {
    setDefaults: (options: unknown) => void
  },
  installFaNotifyConsoleLogging: installFaNotifyConsoleLogging as unknown as (
    notify: { setDefaults: (options: unknown) => void }
  ) => void
})
