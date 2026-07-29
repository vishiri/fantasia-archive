import { ResultAsync } from 'neverthrow'

import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun_manager'

import { createFaBridgeLoadFailureReporting } from './functions/createFaBridgeLoadFailureReporting'

const faBridgeLoadFailureReporting = createFaBridgeLoadFailureReporting({
  ResultAsync,
  runFaAction
})

export const hydrateFromBridgeOrReport =
  faBridgeLoadFailureReporting.hydrateFromBridgeOrReport

export const reportFaBridgeLoadFailure =
  faBridgeLoadFailureReporting.reportFaBridgeLoadFailure
