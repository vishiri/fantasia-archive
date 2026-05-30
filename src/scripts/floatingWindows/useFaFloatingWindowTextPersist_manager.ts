import debounce from 'lodash-es/debounce.js'
import { watch } from 'vue'

import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun_manager'

import { createUseFaFloatingWindowTextPersist } from './functions/createUseFaFloatingWindowTextPersist'

export const useFaFloatingWindowTextPersist = createUseFaFloatingWindowTextPersist({
  debounce,
  runFaAction,
  watch
})
