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
import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'

import { createWindowAppNoteboard } from './functions/createWindowAppNoteboard'

const windowAppNoteboardApi = createWindowAppNoteboard({
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
  FA_FLOATING_WINDOW_POP_TRANSITION_MS,
  computed,
  formatFaKeybindCommandLabelFromSnapshot,
  getFaAppNoteboardStore: () => S_FaAppNoteboard(),
  getFaKeybindsStore: () => S_FaKeybinds(),
  onMounted,
  storeToRefs,
  useFaFloatingWindowFrame,
  useFaFloatingWindowFramePersist,
  useFaFloatingWindowTextPersist,
  watch
})

export const wireWindowAppNoteboardDirectInput = windowAppNoteboardApi.wireWindowAppNoteboardDirectInput

export const useWindowAppNoteboardFramePersist = windowAppNoteboardApi.useWindowAppNoteboardFramePersist

export const useWindowAppNoteboardTextPersist = windowAppNoteboardApi.useWindowAppNoteboardTextPersist

export const useWindowAppNoteboard = windowAppNoteboardApi.useWindowAppNoteboard
