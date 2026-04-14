import type { ComputedRef, Ref } from 'vue'

import type {
  I_faChordSerialized,
  I_faKeybindsRoot,
  T_faKeybindCommandId
} from 'app/types/I_faKeybindsDomain'

/**
 * One row in the Keybind settings table (command metadata + resolved user chord).
 */
export interface I_dialogKeybindSettingsRow {
  commandId: T_faKeybindCommandId
  defaultLabel: string
  editable: boolean
  nameLabel: string
  rowKey: string
  userChord: I_faChordSerialized | null | undefined

  /**
   * When true, the User keybinds column shows Add new… (effective shortcut matches built-in default or is unset).
   */
  userShowsAddNewCombo: boolean
}

/**
 * Props for the nested sheet used while capturing a replacement shortcut.
 */
export interface I_dialogKeybindSettingsCaptureDialogProps {
  actionName: string
  captureError: boolean
  captureErrorMessage: string
  captureInfoMessage: string
  captureLabel: string
  hasPendingChord: boolean
  modelValue: boolean
}

/**
 * Props for the inline capture control shown on a keybind row.
 */
export interface I_dialogKeybindSettingsCaptureFieldProps {
  captureError: boolean
  captureErrorMessage: string
  captureInfoMessage: string
  captureLabel: string
  statusRegionId: string
}

/**
 * Return shape of the DialogKeybindSettings capture composable (refs + handlers).
 */
/**
 * Full capture UI dependency bundle passed into open/clear/set binders and keydown wiring.
 */
export type T_dialogKeybindCaptureActionDeps = {
  captureActionName: Ref<string>
  captureBaselineChord: Ref<I_faChordSerialized | null>
  captureError: Ref<boolean>
  captureErrorMessage: Ref<string>
  captureInfoMessage: Ref<string>
  captureLabel: Ref<string>
  captureOpen: Ref<boolean>
  editingCommandId: Ref<T_faKeybindCommandId | null>
  handleCaptureKeydown: (e: KeyboardEvent) => void
  pendingChord: Ref<I_faChordSerialized | null>
  platform: ComputedRef<NodeJS.Platform>
  removeCaptureListener: () => void
  t: (key: string) => string
  workingOverrides: Ref<I_faKeybindsRoot['overrides']>
}

export type T_createDialogKeybindSettingsCaptureResult = {
  captureActionName: Ref<string>
  captureError: Ref<boolean>
  captureErrorMessage: Ref<string>
  captureInfoMessage: Ref<string>
  captureLabel: Ref<string>
  captureOpen: Ref<boolean>
  onCaptureClear: () => void
  onCaptureSet: () => void
  onOpenCapture: (row: I_dialogKeybindSettingsRow) => void
  pendingChord: Ref<I_faChordSerialized | null>
  removeCaptureListener: () => void
}
