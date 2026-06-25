import { FaProjectOpenFailedError } from 'app/src/scripts/actionManager/functions/faProjectOpenFailedError'
import { i18n } from 'app/i18n/externalFileLoader'

import { faActiveProjectFilePathsMatch } from './functions/faActiveProjectFilePathsMatch'
import { createFaActiveProjectOpenFlow } from './functions/createFaActiveProjectOpenFlow'

const faActiveProjectOpenFlowApi = createFaActiveProjectOpenFlow({
  FaProjectOpenFailedError,
  faActiveProjectFilePathsMatch,
  translateOpenErrorFallback: () => i18n.global.t('globalFunctionality.faProjectSession.openErrorFallback')
})

export const finalizeFaActiveProjectOpenResult =
  faActiveProjectOpenFlowApi.finalizeFaActiveProjectOpenResult

export const tryReuseFaActiveProjectKnownPath =
  faActiveProjectOpenFlowApi.tryReuseFaActiveProjectKnownPath
