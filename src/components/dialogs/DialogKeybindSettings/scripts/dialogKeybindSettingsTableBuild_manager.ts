import { FA_KEYBIND_COMMAND_DEFINITIONS } from 'app/src/scripts/keybinds/functions/faKeybindCommandDefinitions'
import {
  faKeybindChordsEqual,
  faKeybindExpandDefaultChord,
  faKeybindResolveEffectiveChord
} from 'app/src/scripts/keybinds/functions/faKeybindsChordEqualityAndResolve'
import { formatFaKeybindChordForUi } from 'app/src/scripts/keybinds/faKeybindsChordUiFormatting_manager'

import { createDialogKeybindSettingsTableBuild } from './functions/createDialogKeybindSettingsTableBuild'

const dialogKeybindSettingsTableBuildApi = createDialogKeybindSettingsTableBuild({
  FA_KEYBIND_COMMAND_DEFINITIONS,
  faKeybindChordsEqual,
  faKeybindExpandDefaultChord,
  faKeybindResolveEffectiveChord,
  formatFaKeybindChordForUi
})

export const buildDialogKeybindSettingsRows =
  dialogKeybindSettingsTableBuildApi.buildDialogKeybindSettingsRows

export const buildDialogKeybindSettingsTableColumns =
  dialogKeybindSettingsTableBuildApi.buildDialogKeybindSettingsTableColumns
