import type { I_dialogKeybindSettingsRow } from 'app/types/I_dialogKeybindSettings'
import type {
  I_faChordSerialized,
  I_faKeybindCommandDefinition,
  I_faKeybindsRoot,
  T_faKeybindCommandId
} from 'app/types/I_faKeybindsDomain'

type T_createDialogKeybindSettingsTableBuildDeps = {
  FA_KEYBIND_COMMAND_DEFINITIONS: ReadonlyArray<{
    defaultChord: I_faKeybindCommandDefinition['defaultChord']
    editable: boolean
    id: T_faKeybindCommandId
    messageKey: string
  }>
  faKeybindChordsEqual: (a: I_faChordSerialized, b: I_faChordSerialized) => boolean
  faKeybindExpandDefaultChord: (
    defaultChord: I_faKeybindCommandDefinition['defaultChord'],
    platform: NodeJS.Platform
  ) => I_faChordSerialized | null
  faKeybindResolveEffectiveChord: (params: {
    commandId: T_faKeybindCommandId
    defaultChord: I_faKeybindCommandDefinition['defaultChord']
    overrides: I_faKeybindsRoot['overrides']
    platform: NodeJS.Platform
  }) => I_faChordSerialized | null
  formatFaKeybindChordForUi: (chord: I_faChordSerialized, platform: NodeJS.Platform) => string
}

function buildDialogKeybindSettingsRows (
  deps: T_createDialogKeybindSettingsTableBuildDeps,
  params: {
    overrides: I_faKeybindsRoot['overrides']
    platform: NodeJS.Platform
    t: (key: string) => string
  }
): I_dialogKeybindSettingsRow[] {
  const {
    overrides,
    platform,
    t
  } = params

  return deps.FA_KEYBIND_COMMAND_DEFINITIONS.map((def) => {
    const expanded = deps.faKeybindExpandDefaultChord(def.defaultChord, platform)
    const defaultLabel = expanded === null
      ? '—'
      : deps.formatFaKeybindChordForUi(expanded, platform)

    const userChord = deps.faKeybindResolveEffectiveChord({
      commandId: def.id,
      defaultChord: def.defaultChord,
      overrides,
      platform
    })

    const userShowsAddNewCombo =
      userChord === null ||
      userChord === undefined ||
      (expanded !== null &&
        userChord !== null &&
        deps.faKeybindChordsEqual(userChord, expanded))

    return {
      commandId: def.id,
      defaultLabel,
      editable: def.editable,
      nameLabel: t(def.messageKey),
      rowKey: def.id,
      userChord,
      userShowsAddNewCombo
    }
  })
}

function buildDialogKeybindSettingsTableColumns (
  t: (key: string) => string
): Array<{
  align: 'left'
  classes: string
  field: string
  label: string
  name: string
}> {
  return [
    {
      align: 'left',
      classes: 'dialogKeybindSettings__tableColName',
      field: 'nameLabel',
      label: t('dialogs.keybindSettings.columnName'),
      name: 'name'
    },
    {
      align: 'left',
      classes: 'dialogKeybindSettings__tableColUser',
      field: 'userChord',
      label: t('dialogs.keybindSettings.columnUser'),
      name: 'userKeybinds'
    },
    {
      align: 'left',
      classes: 'dialogKeybindSettings__tableColDefault',
      field: 'defaultLabel',
      label: t('dialogs.keybindSettings.columnDefault'),
      name: 'defaultKeybinds'
    }
  ]
}

export function createDialogKeybindSettingsTableBuild (
  deps: T_createDialogKeybindSettingsTableBuildDeps
): {
    buildDialogKeybindSettingsRows: (params: {
      overrides: I_faKeybindsRoot['overrides']
      platform: NodeJS.Platform
      t: (key: string) => string
    }) => I_dialogKeybindSettingsRow[]
    buildDialogKeybindSettingsTableColumns: (t: (key: string) => string) => Array<{
      align: 'left'
      classes: string
      field: string
      label: string
      name: string
    }>
  } {
  return {
    buildDialogKeybindSettingsRows: (params) => buildDialogKeybindSettingsRows(deps, params),
    buildDialogKeybindSettingsTableColumns
  }
}
