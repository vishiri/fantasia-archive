import type { I_dialogKeybindSettingsRow } from 'app/types/I_dialogKeybindSettings'
import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'

/**
 * Label for the per-row user chord button in the keybind settings table.
 */
export function formatDialogKeybindSettingsUserKeybindButtonLabel (
  row: I_dialogKeybindSettingsRow,
  deps: {
    formatChord: (chord: I_faChordSerialized) => string
    t: (key: string) => string
  }
): string {
  if (row.userShowsAddNewCombo) {
    return deps.t('dialogs.keybindSettings.addNew')
  }
  if (row.userChord) {
    return deps.formatChord(row.userChord)
  }
  return ''
}
