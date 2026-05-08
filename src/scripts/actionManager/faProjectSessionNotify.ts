import { Notify } from 'quasar'

import { i18n } from 'app/i18n/externalFileLoader'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

import { formatFaActiveProjectNotifyLabel } from './faProjectSessionNotifyLabel'

export function notifyFaProjectCreatedPositive (): void {
  const projectName = formatFaActiveProjectNotifyLabel(S_FaActiveProject().activeProject)
  const message = i18n.global.t(
    'globalFunctionality.faProjectSession.notifyProjectCreated',
    { projectName }
  )
  Notify.create({
    message,
    type: 'positive'
  })
}

export function notifyFaProjectLoadedPositive (): void {
  const projectName = formatFaActiveProjectNotifyLabel(S_FaActiveProject().activeProject)
  const message = i18n.global.t(
    'globalFunctionality.faProjectSession.notifyProjectLoaded',
    { projectName }
  )
  Notify.create({
    message,
    type: 'positive'
  })
}
