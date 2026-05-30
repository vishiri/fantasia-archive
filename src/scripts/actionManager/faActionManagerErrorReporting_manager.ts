import { Notify } from 'quasar'
import { Result } from 'neverthrow'

import { i18n } from 'app/i18n/externalFileLoader'

import * as faActionManagerStoreBridge from './faActionManagerStoreBridge_manager'
import { FaProjectOpenFailedError } from './functions/faProjectOpenFailedError'
import { createFaActionManagerErrorReporting } from './functions/createFaActionManagerErrorReporting'

const faActionManagerErrorReportingApi = createFaActionManagerErrorReporting({
  FaProjectOpenFailedError,
  fromThrowable: Result.fromThrowable,
  notifyCreate: Notify.create,
  resolveFaActionManagerStore: () => faActionManagerStoreBridge.resolveFaActionManagerStore(),
  translateActionFailed: (actionId) =>
    i18n.global.t('globalFunctionality.faActionManager.actionFailed', {
      actionId
    })
})

export const buildFaActionFailureHistoryPayloadPreview =
  faActionManagerErrorReportingApi.buildFaActionFailureHistoryPayloadPreview

export const buildFaActionPayloadPreview = faActionManagerErrorReportingApi.buildFaActionPayloadPreview

export const normalizeFaActionError = faActionManagerErrorReportingApi.normalizeFaActionError

export const reportFaActionFailure = faActionManagerErrorReportingApi.reportFaActionFailure
