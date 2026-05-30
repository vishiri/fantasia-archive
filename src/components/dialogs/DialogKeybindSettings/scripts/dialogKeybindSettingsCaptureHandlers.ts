import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

import type {
  I_dialogKeybindSettingsRow,
  T_dialogKeybindCaptureActionDeps
} from 'app/types/I_dialogKeybindSettings'
import type { T_dialogKeybindSettingsCaptureHandlersModuleDeps } from 'app/types/I_dialogKeybindSettings'

import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'

import { restorePendingChordAndLabelFromBaseline } from './dialogKeybindSettingsCaptureKeydown'

export function seedCaptureFieldsFromRow (
  deps: Pick<T_dialogKeybindSettingsCaptureHandlersModuleDeps, 'formatFaKeybindChordForUi'>,
  params: {
    captureLabel: I_ref<string>
    pendingChord: I_ref<I_faChordSerialized | null>
    platform: I_computedRef<NodeJS.Platform>
    row: I_dialogKeybindSettingsRow
  }
): void {
  const {
    captureLabel,
    pendingChord,
    platform,
    row
  } = params
  if (row.userShowsAddNewCombo) {
    pendingChord.value = null
    captureLabel.value = ''
    return
  }
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
  captureLabel.value = deps.formatFaKeybindChordForUi(cloned, platform.value)
}

export function syncCaptureBaselineFromPendingChord (params: {
  captureBaselineChord: I_ref<I_faChordSerialized | null>
  pendingChord: I_ref<I_faChordSerialized | null>
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

export function bindOnOpenCapture (
  deps: T_dialogKeybindSettingsCaptureHandlersModuleDeps,
  actionDeps: T_dialogKeybindCaptureActionDeps
): (row: I_dialogKeybindSettingsRow) => void {
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
  } = actionDeps

  return (row: I_dialogKeybindSettingsRow) => {
    if (!row.editable) {
      return
    }
    captureActionName.value = row.nameLabel
    editingCommandId.value = row.commandId
    captureError.value = false
    captureErrorMessage.value = ''
    captureInfoMessage.value = ''
    seedCaptureFieldsFromRow(deps, {
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
    deps.addKeydownListener(handleCaptureKeydown)
  }
}

export function bindOnCaptureClear (
  actionDeps: Pick<T_dialogKeybindCaptureActionDeps, 'captureBaselineChord' | 'captureError' | 'captureErrorMessage' | 'captureInfoMessage' | 'captureLabel' | 'captureOpen' | 'editingCommandId' | 'pendingChord' | 'workingOverrides'>
): () => void {
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
  } = actionDeps

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

export function bindOnCaptureSet (
  deps: T_dialogKeybindSettingsCaptureHandlersModuleDeps,
  actionDeps: T_dialogKeybindCaptureActionDeps
): () => void {
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
  } = actionDeps

  return () => {
    const id = editingCommandId.value
    if (id === null || pendingChord.value === null) {
      return
    }

    const conflict = deps.faKeybindFindChordConflict({
      chord: pendingChord.value,
      excludeCommandId: id,
      overrides: workingOverrides.value,
      platform: platform.value
    })
    if (conflict !== null) {
      captureInfoMessage.value = ''
      captureError.value = true
      captureErrorMessage.value = t('dialogs.keybindSettings.validationConflict')
      restorePendingChordAndLabelFromBaseline(deps, {
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
