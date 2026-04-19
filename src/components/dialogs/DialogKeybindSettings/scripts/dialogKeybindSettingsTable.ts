import { computed, type ComputedRef, type Ref } from 'vue'

import { FA_KEYBIND_COMMAND_DEFINITIONS } from 'app/src/scripts/keybinds/faKeybindCommandDefinitions'
import { formatFaKeybindChordForUi } from 'app/src/scripts/keybinds/faKeybindsChordUiFormatting'
import {
  faKeybindChordsEqual,
  faKeybindExpandDefaultChord,
  faKeybindResolveEffectiveChord
} from 'app/src/scripts/keybinds/faKeybindsChordEqualityAndResolve'
import type { I_dialogKeybindSettingsRow } from 'app/types/I_dialogKeybindSettings'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'

/**
 * Clearable Quasar q-input may set v-model to null; treat non-strings as empty.
 */
function dialogKeybindSettingsFilterTrimmed (
  filter: Ref<string | null | undefined>
): string {
  const v = filter.value
  return typeof v === 'string' ? v.trim() : ''
}

export function buildDialogKeybindSettingsRows (params: {
  overrides: I_faKeybindsRoot['overrides']
  platform: NodeJS.Platform
  t: (key: string) => string
}): I_dialogKeybindSettingsRow[] {
  const {
    overrides,
    platform,
    t
  } = params

  return FA_KEYBIND_COMMAND_DEFINITIONS.map((def) => {
    const expanded = faKeybindExpandDefaultChord(def.defaultChord, platform)
    const defaultLabel = expanded === null
      ? '—'
      : formatFaKeybindChordForUi(expanded, platform)

    const userChord = faKeybindResolveEffectiveChord({
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
        faKeybindChordsEqual(userChord, expanded))

    const nameLabel = t(def.messageKey)
    return {
      commandId: def.id,
      defaultLabel,
      editable: def.editable,
      nameLabel,
      rowKey: def.id,
      userChord,
      userShowsAddNewCombo
    }
  })
}

export function buildDialogKeybindSettingsTableColumns (t: (key: string) => string): Array<{
  align: 'left'
  classes: string
  field: string
  label: string
  name: string
}> {
  const nameLabel = t('dialogs.keybindSettings.columnName')
  const userLabel = t('dialogs.keybindSettings.columnUser')
  const defaultLabel = t('dialogs.keybindSettings.columnDefault')
  const nameColumn = {
    align: 'left' as const,
    classes: 'dialogKeybindSettings__tableColName',
    field: 'nameLabel',
    label: nameLabel,
    name: 'name'
  }
  const userColumn = {
    align: 'left' as const,
    classes: 'dialogKeybindSettings__tableColUser',
    field: 'userChord',
    label: userLabel,
    name: 'userKeybinds'
  }
  const defaultColumn = {
    align: 'left' as const,
    classes: 'dialogKeybindSettings__tableColDefault',
    field: 'defaultLabel',
    label: defaultLabel,
    name: 'defaultKeybinds'
  }
  return [
    nameColumn,
    userColumn,
    defaultColumn
  ]
}

export function createDialogKeybindSettingsTableState (params: {
  filter: Ref<string | null | undefined>
  platform: ComputedRef<NodeJS.Platform>
  t: (key: string) => string
  workingOverrides: Ref<I_faKeybindsRoot['overrides']>
}): {
    tableColumns: ComputedRef<Array<{
      align: 'left'
      classes: string
      field: string
      label: string
      name: string
    }>>
    tableRows: ComputedRef<I_dialogKeybindSettingsRow[]>
  } {
  const {
    filter,
    platform,
    t,
    workingOverrides
  } = params

  const tableRows = computed((): I_dialogKeybindSettingsRow[] => {
    const built = buildDialogKeybindSettingsRows({
      overrides: workingOverrides.value,
      platform: platform.value,
      t: (k: string) => t(k)
    })
    const q = dialogKeybindSettingsFilterTrimmed(filter).toLowerCase()
    if (q.length === 0) {
      return built
    }
    return built.filter((r) => r.nameLabel.toLowerCase().includes(q))
  })

  const tableColumns = computed(() => {
    return buildDialogKeybindSettingsTableColumns(t)
  })

  return {
    tableColumns,
    tableRows
  }
}
