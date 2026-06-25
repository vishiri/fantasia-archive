import { Notify } from 'quasar'
import { Result, ResultAsync } from 'neverthrow'

import { i18n } from 'app/i18n/externalFileLoader'

import {
  recordHistoryCompleted,
  recordHistoryOverflowDrop,
  recordHistoryStarted
} from './faActionManagerHistory_manager'
import {
  buildFaActionErrorOrWarningPayloadPreview,
  buildFaActionFailureHistoryPayloadPreview,
  reportFaActionFailure
} from './faActionManagerErrorReporting_manager'
import * as faActionManagerStoreBridge from './faActionManagerStoreBridge_manager'
import { createFaActionManagerSyncQueue } from './functions/createFaActionManagerSyncQueue'
import { resolveFaActionFailureHistoryPayloadPreviewMerge } from './functions/resolveFaActionFailureHistoryPayloadPreviewMerge'

const faActionSyncTimeoutMs = 30_000
const faActionSyncQueueMax = 32

const faActionManagerSyncQueueApi = createFaActionManagerSyncQueue({
  FA_ACTION_SYNC_QUEUE_MAX: faActionSyncQueueMax,
  FA_ACTION_SYNC_TIMEOUT_MS: faActionSyncTimeoutMs,
  Notify,
  Result,
  ResultAsync,
  buildFaActionErrorOrWarningPayloadPreview,
  buildFaActionFailureHistoryPayloadPreview,
  i18n,
  recordHistoryCompleted,
  recordHistoryOverflowDrop,
  recordHistoryStarted,
  reportFaActionFailure,
  resolveFaActionFailureHistoryPayloadPreviewMerge,
  resolveFaActionManagerStore: () => faActionManagerStoreBridge.resolveFaActionManagerStore()
})

export const FA_ACTION_SYNC_TIMEOUT_MS = faActionManagerSyncQueueApi.FA_ACTION_SYNC_TIMEOUT_MS

export const FA_ACTION_SYNC_QUEUE_MAX = faActionManagerSyncQueueApi.FA_ACTION_SYNC_QUEUE_MAX

export const enqueueSyncAction = faActionManagerSyncQueueApi.enqueueSyncAction

export const awaitSyncQueueDrain = faActionManagerSyncQueueApi.awaitSyncQueueDrain

export const _resetFaActionSyncQueueForTests =
  faActionManagerSyncQueueApi._resetFaActionSyncQueueForTests
