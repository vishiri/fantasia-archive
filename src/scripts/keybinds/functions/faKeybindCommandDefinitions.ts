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
    id: 'openAppSettings',
    messageKey: 'dialogs.keybindSettings.commands.openAppSettings'
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
    id: 'openAppStyling',
    messageKey: 'dialogs.keybindSettings.commands.openAppStyling'
  },
  {
    defaultChord: {
      code: 'KeyJ',
      mods: [
        'ctrl',
        'shift'
      ]
    },
    editable: true,
    firesInEditableFields: true,
    id: 'openProjectStyling',
    messageKey: 'dialogs.keybindSettings.commands.openProjectStyling'
  },
  {
    defaultChord: {
      code: 'KeyP',
      mods: [
        'alt',
        'ctrl',
        'shift'
      ]
    },
    editable: true,
    firesInEditableFields: true,
    id: 'openProjectSettings',
    messageKey: 'dialogs.keybindSettings.commands.openProjectSettings'
  },
  {
    defaultChord: {
      code: 'KeyO',
      mods: [
        'alt',
        'ctrl',
        'shift'
      ]
    },
    editable: true,
    firesInEditableFields: true,
    id: 'showProjectDashboard',
    messageKey: 'dialogs.keybindSettings.commands.showProjectDashboard'
  },
  {
    defaultChord: {
      code: 'KeyE',
      mods: [
        'alt',
        'ctrl'
      ]
    },
    editable: true,
    firesInEditableFields: true,
    id: 'toggleAppNoteboard',
    messageKey: 'dialogs.keybindSettings.commands.toggleAppNoteboard'
  },
  {
    defaultChord: {
      code: 'KeyD',
      mods: [
        'alt',
        'ctrl'
      ]
    },
    editable: true,
    firesInEditableFields: true,
    id: 'toggleProjectNoteboard',
    messageKey: 'dialogs.keybindSettings.commands.toggleProjectNoteboard'
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
  },
  {
    defaultChord: {
      code: 'KeyE',
      mods: ['primary']
    },
    editable: true,
    firesInEditableFields: true,
    id: 'editDocument',
    messageKey: 'dialogs.keybindSettings.commands.editDocument'
  },
  {
    defaultChord: {
      code: 'KeyS',
      mods: ['primary']
    },
    editable: true,
    firesInEditableFields: true,
    id: 'saveDocumentKeepEditMode',
    messageKey: 'dialogs.keybindSettings.commands.saveDocumentKeepEditMode'
  },
  {
    defaultChord: {
      code: 'KeyS',
      mods: [
        'alt',
        'ctrl'
      ]
    },
    editable: true,
    firesInEditableFields: true,
    id: 'saveDocument',
    messageKey: 'dialogs.keybindSettings.commands.saveDocument'
  },
  {
    defaultChord: {
      code: 'ArrowLeft',
      mods: ['alt']
    },
    editable: true,
    firesInEditableFields: true,
    id: 'focusPreviousDocumentTab',
    messageKey: 'dialogs.keybindSettings.commands.focusPreviousDocumentTab'
  },
  {
    defaultChord: {
      code: 'ArrowRight',
      mods: ['alt']
    },
    editable: true,
    firesInEditableFields: true,
    id: 'focusNextDocumentTab',
    messageKey: 'dialogs.keybindSettings.commands.focusNextDocumentTab'
  },
  {
    defaultChord: {
      code: 'ArrowLeft',
      mods: [
        'alt',
        'shift'
      ]
    },
    editable: true,
    firesInEditableFields: true,
    id: 'moveDocumentTabLeft',
    messageKey: 'dialogs.keybindSettings.commands.moveDocumentTabLeft'
  },
  {
    defaultChord: {
      code: 'ArrowRight',
      mods: [
        'alt',
        'shift'
      ]
    },
    editable: true,
    firesInEditableFields: true,
    id: 'moveDocumentTabRight',
    messageKey: 'dialogs.keybindSettings.commands.moveDocumentTabRight'
  }
]

export function findFaKeybindCommandDefinition (
  id: I_faKeybindCommandDefinition['id']
): I_faKeybindCommandDefinition | undefined {
  return FA_KEYBIND_COMMAND_DEFINITIONS.find((d) => d.id === id)
}
