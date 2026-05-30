import { FA_KEYBIND_COMMAND_DEFINITIONS } from './functions/faKeybindCommandDefinitions'
import {
  faKeybindChordsEqual,
  faKeybindResolveEffectiveChord
} from './functions/faKeybindsChordEqualityAndResolve'
import { faKeybindIsEditableTarget } from './functions/faKeybindsGlobalDispatchEditable'
import { faKeybindRunCommand } from './faKeybindRunCommand_manager'

import { createFaKeybindsGlobalDispatchMatch } from './functions/createFaKeybindsGlobalDispatchMatch'

const faKeybindsGlobalDispatchMatchApi = createFaKeybindsGlobalDispatchMatch({
  commandDefinitions: FA_KEYBIND_COMMAND_DEFINITIONS,
  faKeybindChordsEqual,
  faKeybindIsEditableTarget,
  faKeybindResolveEffectiveChord,
  faKeybindRunCommand
})

export const matchGlobalKeybindChordAndDispatch =
  faKeybindsGlobalDispatchMatchApi.matchGlobalKeybindChordAndDispatch
