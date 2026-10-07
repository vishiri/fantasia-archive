import debounce from 'lodash-es/debounce.js'
import { ResultAsync } from 'neverthrow'
import { watch } from 'vue'

import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun_manager'

import { createUseFaFloatingWindowFramePersist } from './functions/createUseFaFloatingWindowFramePersist'
import { registerFaProjectReplacementPersistHook } from './faProjectReplacementPersistHooksWiring'

export const useFaFloatingWindowFramePersist = createUseFaFloatingWindowFramePersist({
  ResultAsync,
  debounce,
  registerBeforeProjectReplacement: registerFaProjectReplacementPersistHook,
  runFaAction,
  watch
})
