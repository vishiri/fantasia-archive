import type { ComputedRef, Ref } from 'vue'

import type {
  I_dialogKeybindSettingsRow,
  T_dialogKeybindCaptureActionDeps
} from 'app/types/I_dialogKeybindSettings'
import {
  restorePendingChordAndLabelFromBaseline,
  runDialogKeybindCaptureKeydown,
  type T_dialogKeybindCaptureKeydownDeps
} from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsCaptureKeydown'
import {
  faKeybindFindChordConflict,
  formatFaChordForDisplay
} from 'app/src/scripts/keybinds/faKeybindsChordDisplayAndConflict'
import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'

export type T_captureChordDeps = T_dialogKeybindCaptureKeydownDeps

export function makeDialogKeybindCaptureKeydownHandler (deps: T_captureChordDeps): (e: KeyboardEvent) => void {
  return (e: KeyboardEvent) => {
    runDialogKeybindCaptureKeydown(e, deps)
  }
}

function seedCaptureFieldsFromRow (params: {
  captureLabel: Ref<string>
  pendingChord: Ref<I_faChordSerialized | null>
  platform: ComputedRef<NodeJS.Platform>
  row: I_dialogKeybindSettingsRow
}): void {
  const {
    captureLabel,
    pendingChord,
    platform,
    row
  } = params
  const seed = row.userChord
  if (seed === null || seed === undefined) {
    pendingChord.value = null
    captureLabel.value = ''
    return
  }
  const cloned: I_faChordSerialized = {
    code: seed.code,
    mods: [...seed.mods]
  }
  pendingChord.value = cloned
  captureLabel.value = formatFaChordForDisplay(cloned, platform.value)
}

function syncCaptureBaselineFromPendingChord (params: {
  captureBaselineChord: Ref<I_faChordSerialized | null>
  pendingChord: Ref<I_faChordSerialized | null>
}): void {
  const {
    captureBaselineChord,
    pendingChord
  } = params
  const v = pendingChord.value
  if (v === null) {
    captureBaselineChord.value = null
    return
  }
  captureBaselineChord.value = {
    code: v.code,
    mods: [...v.mods]
  }
}

export function bindOnOpenCapture (deps: T_dialogKeybindCaptureActionDeps): (row: I_dialogKeybindSettingsRow) => void {
  const {
    captureActionName,
    captureBaselineChord,
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    captureLabel,
    captureOpen,
    editingCommandId,
    handleCaptureKeydown,
    pendingChord,
    platform
  } = deps

  return (row: I_dialogKeybindSettingsRow) => {
    if (!row.editable) {
      return
    }
    captureActionName.value = row.nameLabel
    editingCommandId.value = row.commandId
    captureError.value = false
    captureErrorMessage.value = ''
    captureInfoMessage.value = ''
    seedCaptureFieldsFromRow({
      captureLabel,
      pendingChord,
      platform,
      row
    })
    syncCaptureBaselineFromPendingChord({
      captureBaselineChord,
      pendingChord
    })
    captureOpen.value = true
    window.addEventListener('keydown', handleCaptureKeydown, true)
  }
}

export function bindOnCaptureClear (deps: Pick<T_dialogKeybindCaptureActionDeps, 'captureBaselineChord' | 'captureError' | 'captureErrorMessage' | 'captureInfoMessage' | 'captureLabel' | 'captureOpen' | 'editingCommandId' | 'pendingChord' | 'workingOverrides'>): () => void {
  const {
    captureBaselineChord,
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    captureLabel,
    captureOpen,
    editingCommandId,
    pendingChord,
    workingOverrides
  } = deps

  return () => {
    const id = editingCommandId.value
    if (id !== null) {
      workingOverrides.value = {
        ...workingOverrides.value,
        [id]: null
      }
    }
    captureBaselineChord.value = null
    pendingChord.value = null
    captureLabel.value = ''
    captureError.value = false
    captureErrorMessage.value = ''
    captureInfoMessage.value = ''
    captureOpen.value = false
  }
}

export function bindOnCaptureSet (deps: T_dialogKeybindCaptureActionDeps): () => void {
  const {
    captureBaselineChord,
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    captureLabel,
    captureOpen,
    editingCommandId,
    pendingChord,
    platform,
    t,
    workingOverrides
  } = deps

  return () => {
    const id = editingCommandId.value
    if (id === null || pendingChord.value === null) {
      return
    }

    const conflict = faKeybindFindChordConflict({
      chord: pendingChord.value,
      excludeCommandId: id,
      overrides: workingOverrides.value,
      platform: platform.value
    })
    if (conflict !== null) {
      captureInfoMessage.value = ''
      captureError.value = true
      captureErrorMessage.value = t('dialogs.keybindSettings.validationConflict')
      restorePendingChordAndLabelFromBaseline({
        captureBaselineChord,
        captureLabel,
        pendingChord,
        platform
      })
      return
    }
    workingOverrides.value = {
      ...workingOverrides.value,
      [id]: pendingChord.value
    }
    captureOpen.value = false
  }
}
