import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { i18n } from 'app/i18n/externalFileLoader'
import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun_manager'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

import { createErrorNotFound } from './functions/createErrorNotFound'
import {
  resolveErrorNotFoundCardDetails,
  resolveErrorNotFoundReturnButtonMarginClass,
  resolveErrorNotFoundShowResumeCurrentProject
} from './functions/errorNotFoundPresentation'

const errorNotFoundApi = createErrorNotFound({
  S_FaActiveProject,
  computed,
  i18n,
  resolveErrorNotFoundCardDetails,
  resolveErrorNotFoundReturnButtonMarginClass,
  resolveErrorNotFoundShowResumeCurrentProject,
  runFaAction,
  storeToRefs
})

export const errorNotFoundResumeCurrentProjectClick =
  errorNotFoundApi.errorNotFoundResumeCurrentProjectClick

export const useErrorNotFound = errorNotFoundApi.useErrorNotFound
