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
import { S_FaProjectNoteboard } from 'app/src/stores/S_FaProjectNoteboard'

const windowProjectNoteboardApi = createWindowNoteboard({
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
  FA_FLOATING_WINDOW_POP_TRANSITION_MS,
  computed,
  getNoteboardStore: () => S_FaProjectNoteboard(),
  onMounted,
  storeToRefs,
  useFaFloatingWindowFrame,
  useFaFloatingWindowFramePersist,
  useFaFloatingWindowTextPersist,
  variant: {
    directInputDialogName: 'WindowProjectNoteboard',
    documentNameClass: 'WindowProjectNoteboard',
    floatingWindowZLayer: 'projectNoteboard',
    persistFrameSilent: async (frame) => {
      await S_FaProjectNoteboard().persistProjectNoteboardPartialSilent({ frame })
    },
    saveFailureActionId: 'reportProjectNoteboardSaveFailure'
  },
  watch
})

export const wireWindowProjectNoteboardDirectInput = windowProjectNoteboardApi.wireWindowNoteboardDirectInput

export const useWindowProjectNoteboardFramePersist = windowProjectNoteboardApi.useWindowNoteboardFramePersist

export const useWindowProjectNoteboardTextPersist = windowProjectNoteboardApi.useWindowNoteboardTextPersist

export const useWindowProjectNoteboard = windowProjectNoteboardApi.useWindowNoteboard
