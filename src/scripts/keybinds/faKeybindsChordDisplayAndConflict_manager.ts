import { FA_KEYBIND_COMMAND_DEFINITIONS } from './functions/faKeybindCommandDefinitions'
import {
  faKeybindChordsEqual,
  faKeybindResolveEffectiveChord
} from './functions/faKeybindsChordEqualityAndResolve'

import { createFaKeybindFindChordConflict } from './functions/createFaKeybindFindChordConflict'

const faKeybindFindChordConflictApi = createFaKeybindFindChordConflict({
  commandDefinitions: FA_KEYBIND_COMMAND_DEFINITIONS,
  faKeybindChordsEqual,
  faKeybindResolveEffectiveChord
})

export const faKeybindFindChordConflict =
  faKeybindFindChordConflictApi.faKeybindFindChordConflict
