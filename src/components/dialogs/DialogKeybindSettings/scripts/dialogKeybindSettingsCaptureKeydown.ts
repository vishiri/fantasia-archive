import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

import type { T_dialogKeybindCaptureKeydownDeps } from 'app/types/I_dialogKeybindSettings'
import type { T_dialogKeybindSettingsCaptureKeydownModuleDeps } from 'app/types/I_dialogKeybindSettings'

import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'

export function restorePendingChordAndLabelFromBaseline (
  deps: T_dialogKeybindSettingsCaptureKeydownModuleDeps,
  params: {
    captureBaselineChord: I_ref<I_faChordSerialized | null>
    captureLabel: I_ref<string>
    pendingChord: I_ref<I_faChordSerialized | null>
    platform: I_computedRef<NodeJS.Platform>
  }
): void {
  const {
    captureBaselineChord,
    captureLabel,
    pendingChord,
    platform
  } = params
  const baseline = captureBaselineChord.value
  if (baseline === null) {
    pendingChord.value = null
    captureLabel.value = ''
    return
  }
  pendingChord.value = {
    code: baseline.code,
    mods: [...baseline.mods]
  }
  captureLabel.value = deps.formatFaKeybindChordForUi(baseline, platform.value)
}

function applyCaptureKeydownReject (
  keydownDeps: T_dialogKeybindCaptureKeydownDeps,
  reason: 'modifier_key_alone' | 'need_modifier' | 'unsupported_key'
): void {
  const {
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    t
  } = keydownDeps
  if (reason === 'modifier_key_alone') {
    captureInfoMessage.value = ''
    if (
      captureError.value &&
      captureErrorMessage.value !== t('dialogs.keybindSettings.validationConflict')
    ) {
      captureError.value = false
      captureErrorMessage.value = ''
    }
    return
  }
  captureInfoMessage.value = ''
  const reasonKeys = {
    need_modifier: 'dialogs.keybindSettings.validationNeedModifier',
    unsupported_key: 'dialogs.keybindSettings.validationUnsupportedKey'
  } as const
  captureError.value = true
  captureErrorMessage.value = t(reasonKeys[reason])
}

function applyCaptureKeydownAccept (
  deps: T_dialogKeybindSettingsCaptureKeydownModuleDeps,
  keydownDeps: T_dialogKeybindCaptureKeydownDeps,
  chord: I_faChordSerialized
): void {
  const {
    captureBaselineChord,
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    captureLabel,
    editingCommandId,
    pendingChord,
    platform,
    t,
    workingOverrides
  } = keydownDeps
  captureError.value = false
  captureErrorMessage.value = ''
  captureInfoMessage.value = ''
  pendingChord.value = chord
  captureLabel.value = deps.formatFaKeybindChordForUi(chord, platform.value)

  const id = editingCommandId.value
  if (id === null) {
    return
  }
  const conflict = deps.faKeybindFindChordConflict({
    chord,
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
  }
}

export function runDialogKeybindCaptureKeydown (
  deps: T_dialogKeybindSettingsCaptureKeydownModuleDeps,
  e: KeyboardEvent,
  keydownDeps: T_dialogKeybindCaptureKeydownDeps
): void {
  if (e.key === 'Escape' || e.code === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    keydownDeps.captureOpen.value = false
    return
  }
  e.preventDefault()
  e.stopPropagation()
  const chordResult = deps.faKeybindTryChordFromEvent(e)
  if (!chordResult.ok) {
    applyCaptureKeydownReject(keydownDeps, chordResult.reason)
    return
  }
  applyCaptureKeydownAccept(deps, keydownDeps, chordResult.chord)
}

export function makeDialogKeybindCaptureKeydownHandler (
  deps: T_dialogKeybindSettingsCaptureKeydownModuleDeps,
  keydownDeps: T_dialogKeybindCaptureKeydownDeps
): (e: KeyboardEvent) => void {
  return (e: KeyboardEvent) => {
    runDialogKeybindCaptureKeydown(deps, e, keydownDeps)
  }
}
