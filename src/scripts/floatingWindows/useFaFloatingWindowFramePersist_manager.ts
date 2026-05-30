import debounce from 'lodash-es/debounce.js'
import { watch } from 'vue'

import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun_manager'

import { createUseFaFloatingWindowFramePersist } from './functions/createUseFaFloatingWindowFramePersist'

export const useFaFloatingWindowFramePersist = createUseFaFloatingWindowFramePersist({
  debounce,
  runFaAction,
  watch
})
