import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'

import {
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
  FA_FLOATING_WINDOW_POP_TRANSITION_MS,
  useFaFloatingWindowFrame,
  useFaFloatingWindowFramePersist,
  useFaFloatingWindowTextPersist
} from 'app/src/scripts/floatingWindows/floatingWindows_manager'
import { formatFaKeybindCommandLabelFromSnapshot } from 'app/src/scripts/keybinds/keybinds_manager'
import { createWindowNoteboard } from 'app/src/components/floatingWindows/_sharedWindowNoteboard/scripts/windowNoteboard_manager'
import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'

const windowAppNoteboardApi = createWindowNoteboard({
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
  FA_FLOATING_WINDOW_POP_TRANSITION_MS,
  computed,
  formatFaKeybindCommandLabelFromSnapshot,
  getFaKeybindsStore: () => S_FaKeybinds(),
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
    saveFailureActionId: 'reportAppNoteboardSaveFailure',
    toggleKeybindCommandId: 'toggleAppNoteboard'
  },
  watch
})

export const wireWindowAppNoteboardDirectInput = windowAppNoteboardApi.wireWindowNoteboardDirectInput

export const useWindowAppNoteboardFramePersist = windowAppNoteboardApi.useWindowNoteboardFramePersist

export const useWindowAppNoteboardTextPersist = windowAppNoteboardApi.useWindowNoteboardTextPersist

export const useWindowAppNoteboard = windowAppNoteboardApi.useWindowNoteboard
