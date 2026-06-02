import { Notify } from 'quasar'
import { Result } from 'neverthrow'

import { i18n } from 'app/i18n/externalFileLoader'

import * as faActionManagerStoreBridge from './faActionManagerStoreBridge_manager'
import { createFaActionManagerErrorReporting } from './functions/createFaActionManagerErrorReporting'
import {
  normalizeFaActionError as normalizeFaActionErrorImpl,
  readFaProjectOpenFailedShape,
  resolveFaActionFailureNotifyCaption
} from './faActionManagerErrorReportingNormalize'

const faActionManagerErrorReportingApi = createFaActionManagerErrorReporting({
  fromThrowable: Result.fromThrowable,
  normalizeFaActionError: normalizeFaActionErrorImpl,
  notifyCreate: (options) => Notify.create(options),
  readFaProjectOpenFailedShape,
  resolveFaActionFailureNotifyCaption,
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
