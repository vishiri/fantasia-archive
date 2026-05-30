import { v4 as uuidv4 } from 'uuid'
import { ResultAsync } from 'neverthrow'

import * as faActionDefinitionsModule from './faActionDefinitions_manager'
import {
  recordHistoryCompleted,
  recordHistoryEnqueued,
  recordHistoryStartedFromEntry
} from './faActionManagerHistory_manager'
import { enqueueSyncAction } from './faActionManagerSyncQueue_manager'
import {
  buildFaActionFailureHistoryPayloadPreview,
  reportFaActionFailure
} from './faActionManagerErrorReporting_manager'
import { FaActionUserCanceledError } from './functions/faActionUserCanceledError'
import { createFaActionManagerRun } from './faActionManagerRunApi'
import { resolveFaActionManagerStore } from './faActionManagerStoreBridge_manager'
import { wireFaActionManagerRunForward } from './faActionManagerRunForward_manager'

const faActionManagerRun = createFaActionManagerRun({
  FaActionUserCanceledError,
  ResultAsync,
  buildFaActionFailureHistoryPayloadPreview,
  enqueueSyncAction,
  findFaActionDefinition: (id) => faActionDefinitionsModule.findFaActionDefinition(id),
  nowMs: () => Date.now(),
  recordHistoryCompleted,
  recordHistoryEnqueued,
  recordHistoryStartedFromEntry,
  reportFaActionFailure,
  resolveFaActionManagerStore,
  uuidv4
})

export const runFaAction = faActionManagerRun.runFaAction

export const runFaActionAwait = faActionManagerRun.runFaActionAwait

wireFaActionManagerRunForward({
  runFaAction
})
