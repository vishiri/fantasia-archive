import { computed, type ComputedRef, type Ref } from 'vue'

import { FA_KEYBIND_COMMAND_DEFINITIONS } from 'app/src/scripts/keybinds/faKeybindCommandDefinitions'
import { formatFaChordForDisplay } from 'app/src/scripts/keybinds/faKeybindsChordDisplayAndConflict'
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
      : formatFaChordForDisplay(expanded, platform)

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

export function buildDialogKeybindSettingsTableColumns (t: (key: string) => string): Array<{
  align: 'left'
  field: string
  label: string
  name: string
}> {
  return [
    {
      align: 'left',
      field: 'nameLabel',
      label: t('dialogs.keybindSettings.columnName'),
      name: 'name'
    },
    {
      align: 'left',
      field: 'userChord',
      label: t('dialogs.keybindSettings.columnUser'),
      name: 'userKeybinds'
    },
    {
      align: 'left',
      field: 'defaultLabel',
      label: t('dialogs.keybindSettings.columnDefault'),
      name: 'defaultKeybinds'
    }
  ]
}

export function createDialogKeybindSettingsTableState (params: {
  filter: Ref<string | null | undefined>
  platform: ComputedRef<NodeJS.Platform>
  t: (key: string) => string
  workingOverrides: Ref<I_faKeybindsRoot['overrides']>
}): {
    tableColumns: ComputedRef<Array<{ align: 'left', field: string, label: string, name: string }>>
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
