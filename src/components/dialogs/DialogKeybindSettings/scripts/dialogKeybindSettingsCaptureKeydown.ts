import type { ComputedRef, Ref } from 'vue'

import { faKeybindFindChordConflict } from 'app/src/scripts/keybinds/faKeybindFindChordConflict'
import { faKeybindTryChordFromEvent } from 'app/src/scripts/keybinds/faKeybindTryChordFromEvent'
import { formatFaChordForDisplay } from 'app/src/scripts/keybinds/formatFaChordForDisplay'
import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'

export type T_dialogKeybindCaptureKeydownDeps = {
  captureBaselineChord: Ref<I_faChordSerialized | null>
  captureError: Ref<boolean>
  captureErrorMessage: Ref<string>
  captureInfoMessage: Ref<string>
  captureLabel: Ref<string>
  editingCommandId: Ref<T_faKeybindCommandId | null>
  pendingChord: Ref<I_faChordSerialized | null>
  platform: ComputedRef<NodeJS.Platform>
  t: (key: string) => string
  workingOverrides: Ref<I_faKeybindsRoot['overrides']>
}

export function restorePendingChordAndLabelFromBaseline (params: {
  captureBaselineChord: Ref<I_faChordSerialized | null>
  captureLabel: Ref<string>
  pendingChord: Ref<I_faChordSerialized | null>
  platform: ComputedRef<NodeJS.Platform>
}): void {
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
  captureLabel.value = formatFaChordForDisplay(baseline, platform.value)
}

function applyCaptureKeydownReject (
  deps: T_dialogKeybindCaptureKeydownDeps,
  reason: 'modifier_key_alone' | 'need_modifier' | 'unsupported_key'
): void {
  const {
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    t
  } = deps
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
  deps: T_dialogKeybindCaptureKeydownDeps,
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
  } = deps
  captureError.value = false
  captureErrorMessage.value = ''
  captureInfoMessage.value = ''
  pendingChord.value = chord
  captureLabel.value = formatFaChordForDisplay(chord, platform.value)

  const id = editingCommandId.value
  if (id === null) {
    return
  }
  const conflict = faKeybindFindChordConflict({
    chord,
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
  }
}

/**
 * Applies one keydown inside the keybind capture dialog: hints, chord label, and duplicate detection.
 */
export function runDialogKeybindCaptureKeydown (e: KeyboardEvent, deps: T_dialogKeybindCaptureKeydownDeps): void {
  e.preventDefault()
  e.stopPropagation()
  const chordResult = faKeybindTryChordFromEvent(e)
  if (!chordResult.ok) {
    applyCaptureKeydownReject(deps, chordResult.reason)
    return
  }
  applyCaptureKeydownAccept(deps, chordResult.chord)
}
