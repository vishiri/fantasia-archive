import type { T_dialogKeybindCaptureKeydownDeps } from 'app/types/I_dialogKeybindSettings'
import type {
  T_dialogKeybindSettingsCaptureKeydownFactoryBindings
} from 'app/types/I_dialogKeybindSettingsFactories'
import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'

export function createDialogKeybindSettingsCaptureKeydown (
  bindings: T_dialogKeybindSettingsCaptureKeydownFactoryBindings
): {
    makeDialogKeybindCaptureKeydownHandler: (
      keydownDeps: T_dialogKeybindCaptureKeydownDeps
    ) => (e: KeyboardEvent) => void
    restorePendingChordAndLabelFromBaseline: (params: {
      captureBaselineChord: I_ref<I_faChordSerialized | null>
      captureLabel: I_ref<string>
      pendingChord: I_ref<I_faChordSerialized | null>
      platform: I_computedRef<NodeJS.Platform>
    }) => void
    runDialogKeybindCaptureKeydown: (
      e: KeyboardEvent,
      keydownDeps: T_dialogKeybindCaptureKeydownDeps
    ) => void
  } {
  const {
    keydownDeps,
    makeDialogKeybindCaptureKeydownHandler: makeImpl,
    restorePendingChordAndLabelFromBaseline: restoreImpl,
    runDialogKeybindCaptureKeydown: runImpl
  } = bindings

  const makeHandler = (
    captureKeydownDeps: T_dialogKeybindCaptureKeydownDeps
  ): ((e: KeyboardEvent) => void) => {
    return makeImpl(keydownDeps, captureKeydownDeps)
  }

  const restoreBaseline = (params: {
    captureBaselineChord: I_ref<I_faChordSerialized | null>
    captureLabel: I_ref<string>
    pendingChord: I_ref<I_faChordSerialized | null>
    platform: I_computedRef<NodeJS.Platform>
  }): void => {
    restoreImpl(keydownDeps, params)
  }

  const runKeydown = (
    e: KeyboardEvent,
    captureKeydownDeps: T_dialogKeybindCaptureKeydownDeps
  ): void => {
    runImpl(keydownDeps, e, captureKeydownDeps)
  }

  return {
    makeDialogKeybindCaptureKeydownHandler: makeHandler,
    restorePendingChordAndLabelFromBaseline: restoreBaseline,
    runDialogKeybindCaptureKeydown: runKeydown
  }
}
