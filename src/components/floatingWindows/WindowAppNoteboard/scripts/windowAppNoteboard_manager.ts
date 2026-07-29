import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'

import {
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
  FA_FLOATING_WINDOW_POP_TRANSITION_MS,
  useFaFloatingWindowFrame,
  useFaFloatingWindowFramePersist,
  useFaFloatingWindowTextPersist
} from 'app/src/scripts/floatingWindows/floatingWindows_manager'
import { createWindowNoteboard } from 'app/src/components/floatingWindows/_sharedWindowNoteboard/scripts/windowNoteboard_manager'
import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'

const windowAppNoteboardApi = createWindowNoteboard({
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
  FA_FLOATING_WINDOW_POP_TRANSITION_MS,
  computed,
  getNoteboardStore: () => S_FaAppNoteboard(),
  onMounted,
  storeToRefs,
  useFaFloatingWindowFrame,
  useFaFloatingWindowFramePersist,
  useFaFloatingWindowTextPersist,
  variant: {
    directInputDialogName: 'WindowAppNoteboard',
    documentNameClass: 'WindowAppNoteboard',
    floatingWindowZLayer: 'noteboard',
    persistFrameSilent: async (frame) => {
      await S_FaAppNoteboard().persistNoteboardPartialSilent({ frame })
    },
    saveFailureActionId: 'reportAppNoteboardSaveFailure'
  },
  watch
})

export const wireWindowAppNoteboardDirectInput = windowAppNoteboardApi.wireWindowNoteboardDirectInput

export const useWindowAppNoteboardFramePersist = windowAppNoteboardApi.useWindowNoteboardFramePersist

export const useWindowAppNoteboardTextPersist = windowAppNoteboardApi.useWindowNoteboardTextPersist

export const useWindowAppNoteboard = windowAppNoteboardApi.useWindowNoteboard
