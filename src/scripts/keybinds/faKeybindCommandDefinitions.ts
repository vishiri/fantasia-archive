import type { I_faKeybindCommandDefinition } from 'app/types/I_faKeybindsDomain'

export const FA_KEYBIND_COMMAND_DEFINITIONS: I_faKeybindCommandDefinition[] = [
  {
    defaultChord: {
      code: 'F12',
      mods: ['primary']
    },
    editable: true,
    firesInEditableFields: true,
    id: 'toggleDeveloperTools',
    messageKey: 'dialogs.keybindSettings.commands.toggleDeveloperTools'
  },
  {
    defaultChord: {
      code: 'KeyL',
      mods: [
        'alt',
        'primary',
        'shift'
      ]
    },
    editable: true,
    firesInEditableFields: true,
    id: 'openProgramSettings',
    messageKey: 'dialogs.keybindSettings.commands.openProgramSettings'
  },
  {
    defaultChord: {
      code: 'KeyK',
      mods: [
        'alt',
        'primary',
        'shift'
      ]
    },
    editable: true,
    firesInEditableFields: true,
    id: 'openKeybindSettings',
    messageKey: 'dialogs.keybindSettings.commands.openKeybindSettings'
  },
  {
    defaultChord: {
      code: 'KeyJ',
      mods: [
        'alt',
        'primary',
        'shift'
      ]
    },
    editable: true,
    firesInEditableFields: true,
    id: 'openProgramStyling',
    messageKey: 'dialogs.keybindSettings.commands.openProgramStyling'
  },
  {
    defaultChord: {
      code: 'F11',
      mods: ['primary']
    },
    editable: true,
    firesInEditableFields: true,
    id: 'openActionMonitor',
    messageKey: 'dialogs.keybindSettings.commands.openActionMonitor'
  },
  {
    defaultChord: {
      code: 'KeyG',
      mods: [
        'alt',
        'ctrl',
        'shift'
      ]
    },
    editable: true,
    firesInEditableFields: true,
    id: 'openAdvancedSearchGuide',
    messageKey: 'dialogs.keybindSettings.commands.openAdvancedSearchGuide'
  }
]

export function findFaKeybindCommandDefinition (
  id: I_faKeybindCommandDefinition['id']
): I_faKeybindCommandDefinition | undefined {
  return FA_KEYBIND_COMMAND_DEFINITIONS.find((d) => d.id === id)
}
