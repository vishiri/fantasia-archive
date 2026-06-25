import {
  buildFaActionErrorOrWarningPayloadPreview,
  buildFaActionPayloadPreview
} from './faActionManagerErrorReporting_manager'
import { resolveFaActionManagerStore } from './faActionManagerStoreBridge_manager'

import { createFaActionManagerHistory } from './functions/createFaActionManagerHistory'

const faActionManagerHistoryApi = createFaActionManagerHistory({
  buildFaActionErrorOrWarningPayloadPreview,
  buildFaActionPayloadPreview,
  resolveFaActionManagerStore
})

export const recordHistoryEnqueued = faActionManagerHistoryApi.recordHistoryEnqueued

export const recordHistoryStarted = faActionManagerHistoryApi.recordHistoryStarted

export const recordHistoryStartedFromEntry =
  faActionManagerHistoryApi.recordHistoryStartedFromEntry

export const recordHistoryCompleted = faActionManagerHistoryApi.recordHistoryCompleted

export const recordHistoryOverflowDrop = faActionManagerHistoryApi.recordHistoryOverflowDrop

export const snapshotActionHistory = faActionManagerHistoryApi.snapshotActionHistory
