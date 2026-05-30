import { Notify } from 'quasar'

import { i18n } from 'app/i18n/externalFileLoader'

import { createNotifyWelcomeScreenRecentProjectFileMissing } from './functions/createNotifyWelcomeScreenRecentProjectFileMissing'

const notifyWelcomeScreenRecentProjectFileMissingApi =
  createNotifyWelcomeScreenRecentProjectFileMissing({
    createNotify: (opts) => Notify.create(opts),
    t: (key, params) => i18n.global.t(key, params)
  })

export const notifyWelcomeScreenRecentProjectFileMissing =
  notifyWelcomeScreenRecentProjectFileMissingApi.notifyWelcomeScreenRecentProjectFileMissing
