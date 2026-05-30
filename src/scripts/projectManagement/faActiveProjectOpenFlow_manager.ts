import { FaProjectOpenFailedError } from 'app/src/scripts/actionManager/functions/faProjectOpenFailedError'

import { faActiveProjectFilePathsMatch } from './functions/faActiveProjectFilePathsMatch'
import { createFaActiveProjectOpenFlow } from './functions/createFaActiveProjectOpenFlow'

const faActiveProjectOpenFlowApi = createFaActiveProjectOpenFlow({
  FaProjectOpenFailedError,
  faActiveProjectFilePathsMatch
})

export const finalizeFaActiveProjectOpenResult =
  faActiveProjectOpenFlowApi.finalizeFaActiveProjectOpenResult

export const tryReuseFaActiveProjectKnownPath =
  faActiveProjectOpenFlowApi.tryReuseFaActiveProjectKnownPath
