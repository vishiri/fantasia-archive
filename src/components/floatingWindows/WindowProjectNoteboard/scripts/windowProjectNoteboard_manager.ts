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
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import { S_FaProjectNoteboard } from 'app/src/stores/S_FaProjectNoteboard'

import { createWindowProjectNoteboard } from './functions/createWindowProjectNoteboard'

const windowProjectNoteboardApi = createWindowProjectNoteboard({
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
  FA_FLOATING_WINDOW_POP_TRANSITION_MS,
  computed,
  formatFaKeybindCommandLabelFromSnapshot,
  getFaKeybindsStore: () => S_FaKeybinds(),
  getFaProjectNoteboardStore: () => S_FaProjectNoteboard(),
  onMounted,
  storeToRefs,
  useFaFloatingWindowFrame,
  useFaFloatingWindowFramePersist,
  useFaFloatingWindowTextPersist,
  watch
})

export const wireWindowProjectNoteboardDirectInput = windowProjectNoteboardApi.wireWindowProjectNoteboardDirectInput

export const useWindowProjectNoteboardFramePersist = windowProjectNoteboardApi.useWindowProjectNoteboardFramePersist

export const useWindowProjectNoteboardTextPersist = windowProjectNoteboardApi.useWindowProjectNoteboardTextPersist

export const useWindowProjectNoteboard = windowProjectNoteboardApi.useWindowProjectNoteboard
