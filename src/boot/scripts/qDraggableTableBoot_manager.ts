import type { I_vuePlugin } from 'app/types/I_vueCompositionShims'

import qDraggableTable from 'quasar-ui-q-draggable-table'
import 'quasar-ui-q-draggable-table/dist/index.css'

import { createRunQDraggableTableBoot } from './functions/createRunQDraggableTableBoot'

export const runQDraggableTableBoot = createRunQDraggableTableBoot({
  VuePlugin: qDraggableTable as unknown as I_vuePlugin
})
