import { Notify } from 'quasar'

import { i18n } from 'app/i18n/externalFileLoader'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

import { createFaProjectSessionNotify } from './functions/createFaProjectSessionNotify'
import { formatFaActiveProjectNotifyLabel } from './functions/faProjectSessionNotifyLabel'

const faProjectSessionNotifyApi = createFaProjectSessionNotify({
  createNotify: (opts) => Notify.create(opts),
  formatProjectLabel: formatFaActiveProjectNotifyLabel,
  getActiveProject: () => S_FaActiveProject().activeProject,
  t: (key, params) => i18n.global.t(key, params)
})

export const notifyFaProjectCreatedPositive =
  faProjectSessionNotifyApi.notifyFaProjectCreatedPositive

export const notifyFaProjectLoadedPositive =
  faProjectSessionNotifyApi.notifyFaProjectLoadedPositive

export const notifyFaProjectAlreadyActiveWarning =
  faProjectSessionNotifyApi.notifyFaProjectAlreadyActiveWarning
