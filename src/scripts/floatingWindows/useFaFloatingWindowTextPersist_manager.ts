import debounce from 'lodash-es/debounce.js'
import { ResultAsync } from 'neverthrow'
import { watch } from 'vue'

import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun_manager'

import { createUseFaFloatingWindowTextPersist } from './functions/createUseFaFloatingWindowTextPersist'

export const useFaFloatingWindowTextPersist = createUseFaFloatingWindowTextPersist({
  ResultAsync,
  debounce,
  runFaAction,
  watch
})
