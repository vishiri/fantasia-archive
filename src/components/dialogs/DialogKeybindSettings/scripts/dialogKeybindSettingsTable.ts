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

const VISUAL_STUB_ROW_COUNT = 30

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

/**
 * Appends non-editable placeholder rows for layout or CSS tuning when enable is true.
 * Dialog table enables this only outside unit tests (dev or Storybook production preview).
 */
export function appendVisualStubKeybindRows (
  rows: I_dialogKeybindSettingsRow[],
  options: { enable: boolean }
): I_dialogKeybindSettingsRow[] {
  if (!options.enable) {
    return rows
  }

  const stubs: I_dialogKeybindSettingsRow[] = []
  for (let i = 0; i < VISUAL_STUB_ROW_COUNT; i++) {
    const n = i + 1
    const cycle = i % 3
    const defaultLabels = [
      'Ctrl + F12',
      'Ctrl + Alt + Shift + L',
      'Ctrl + Alt + Shift + K'
    ]
    stubs.push({
      commandId: 'openKeybindSettings',
      defaultLabel: defaultLabels[cycle],
      editable: false,
      nameLabel: `Style preview ${n}`,
      rowKey: `dialogKeybindSettings-visual-stub-${i}`,
      userChord: cycle === 0
        ? {
            code: 'KeyQ',
            mods: ['ctrl']
          }
        : null,
      userShowsAddNewCombo: cycle !== 0
    })
  }

  return [
    ...rows,
    ...stubs
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
    const rows = appendVisualStubKeybindRows(built, {
      enable: import.meta.env.DEV && import.meta.env.MODE !== 'test'
    })
    const q = dialogKeybindSettingsFilterTrimmed(filter).toLowerCase()
    if (q.length === 0) {
      return rows
    }
    return rows.filter((r) => r.nameLabel.toLowerCase().includes(q))
  })

  const tableColumns = computed(() => {
    return buildDialogKeybindSettingsTableColumns(t)
  })

  return {
    tableColumns,
    tableRows
  }
}
