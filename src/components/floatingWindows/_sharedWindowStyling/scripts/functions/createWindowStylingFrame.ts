import type { I_faFloatingWindowPersistedRect } from 'app/types/I_faFloatingWindowPersistedRect'
import type {
  I_FaWindowAppStylingState,
  I_faMonacoKeybindHelpItem,
  I_WindowAppStylingSurface
} from 'app/types/I_faWindowStylingMonaco'
import type { T_useFaFloatingWindowFrameInjected } from 'app/types/I_useFaFloatingWindowFrameInjected'
import type { ComputedRef, Ref } from 'app/types/I_vueCompositionRefs'

function buildWindowStylingSurfaceReturn (input: {
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS: Record<string, string | boolean>
  FA_FLOATING_WINDOW_POP_TRANSITION_MS: number
  buildFaColorVarSwatchStyle: (cssVar: string) => Record<string, string>
  frame: ReturnType<T_useFaFloatingWindowFrameInjected>
  frameStyleWithDialogTransition: ComputedRef<Record<string, string>>
  helpMenu: {
    helpKeybindMenuOpen: Ref<boolean>
    onHelpIconMouseEnter: () => void
    onHelpIconMouseLeave: () => void
  }
  helpPanel: {
    faThemeCustomPropertyNames: Ref<readonly string[]>
    monacoKeybindHelpItems: ComputedRef<I_faMonacoKeybindHelpItem[]>
  }
  stylingState: I_FaWindowAppStylingState
}): I_WindowAppStylingSurface {
  const FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS_OUT = input.FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS
  const FA_FLOATING_WINDOW_POP_TRANSITION_MS_OUT = input.FA_FLOATING_WINDOW_POP_TRANSITION_MS
  const buildFaColorVarSwatchStyleOut = input.buildFaColorVarSwatchStyle
  const closeWithoutSavingOut = input.stylingState.closeWithoutSaving
  const documentNameOut = input.stylingState.documentName
  const editorHostRefOut = input.stylingState.editorHostRef
  const faThemeCustomPropertyNamesOut = input.helpPanel.faThemeCustomPropertyNames
  const frameRefOut = input.frame.frameRef
  const frameStyleWithDialogTransitionOut = input.frameStyleWithDialogTransition
  const helpKeybindMenuOpenOut = input.helpMenu.helpKeybindMenuOpen
  const hOut = input.frame.h
  const monacoOut = input.stylingState.monaco
  const monacoKeybindHelpItemsOut = input.helpPanel.monacoKeybindHelpItems
  const onFramePointerDownOut = input.frame.onFramePointerDown
  const onHelpIconMouseEnterOut = input.helpMenu.onHelpIconMouseEnter
  const onHelpIconMouseLeaveOut = input.helpMenu.onHelpIconMouseLeave
  const onResizePointerDownOut = input.frame.onResizePointerDown
  const onTitlePointerDownOut = input.frame.onTitlePointerDown
  const saveAndCloseWindowOut = input.stylingState.saveAndCloseWindow
  const titleShortFrameClassOut = input.frame.titleShortFrameClass
  const wOut = input.frame.w
  const windowModelOut = input.stylingState.windowModel
  const workingCssOut = input.stylingState.workingCss
  const xOut = input.frame.x
  const yOut = input.frame.y

  return {
    FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS: FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS_OUT,
    FA_FLOATING_WINDOW_POP_TRANSITION_MS: FA_FLOATING_WINDOW_POP_TRANSITION_MS_OUT,
    buildFaColorVarSwatchStyle: buildFaColorVarSwatchStyleOut,
    closeWithoutSaving: closeWithoutSavingOut,
    documentName: documentNameOut,
    editorHostRef: editorHostRefOut,
    faThemeCustomPropertyNames: faThemeCustomPropertyNamesOut,
    frameRef: frameRefOut,
    frameStyleWithDialogTransition: frameStyleWithDialogTransitionOut,
    helpKeybindMenuOpen: helpKeybindMenuOpenOut,
    h: hOut,
    monaco: monacoOut,
    monacoKeybindHelpItems: monacoKeybindHelpItemsOut,
    onFramePointerDown: onFramePointerDownOut,
    onHelpIconMouseEnter: onHelpIconMouseEnterOut,
    onHelpIconMouseLeave: onHelpIconMouseLeaveOut,
    onResizePointerDown: onResizePointerDownOut,
    onTitlePointerDown: onTitlePointerDownOut,
    saveAndCloseWindow: saveAndCloseWindowOut,
    titleShortFrameClass: titleShortFrameClassOut,
    w: wOut,
    windowModel: windowModelOut,
    workingCss: workingCssOut,
    x: xOut,
    y: yOut
  }
}

export function createWindowStylingFrame (deps: {
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS: Record<string, string | boolean>
  FA_FLOATING_WINDOW_POP_TRANSITION_MS: number
  buildFaColorVarSwatchStyle: (cssVar: string) => Record<string, string>
  computed: <T>(getter: () => T) => ComputedRef<T>
  useFaFloatingWindowFrame: T_useFaFloatingWindowFrameInjected
  useWindowStylingFramePersist: (opts: {
    h: Ref<number>
    windowModel: Ref<boolean>
    w: Ref<number>
    x: Ref<number>
    y: Ref<number>
  }) => void
  useWindowStylingHelpMenu: () => {
    helpKeybindMenuOpen: Ref<boolean>
    onHelpIconMouseEnter: () => void
    onHelpIconMouseLeave: () => void
  }
  useWindowStylingHelpPanel: (
    helpKeybindMenuOpen: Ref<boolean | undefined>
  ) => {
    faThemeCustomPropertyNames: Ref<readonly string[]>
    monacoKeybindHelpItems: ComputedRef<I_faMonacoKeybindHelpItem[]>
  }
}): {
    useWindowStylingSurface: (input: {
      floatingWindowZLayer?: 'projectStyling' | 'standard'
      getPersistedFrame: () => I_faFloatingWindowPersistedRect | null
      onSurfaceWired?: (stylingState: I_FaWindowAppStylingState) => void
      stylingState: I_FaWindowAppStylingState
    }) => I_WindowAppStylingSurface
  } {
  function useWindowStylingSurface (input: {
    floatingWindowZLayer?: 'projectStyling' | 'standard'
    getPersistedFrame: () => I_faFloatingWindowPersistedRect | null
    onSurfaceWired?: (stylingState: I_FaWindowAppStylingState) => void
    stylingState: I_FaWindowAppStylingState
  }): I_WindowAppStylingSurface {
    const stylingState = input.stylingState
    const persistedStylingFrame = deps.computed(() => input.getPersistedFrame())

    const frameOptions: {
      floatingWindowZLayer?: 'projectStyling' | 'standard'
      persistedFrame: ComputedRef<I_faFloatingWindowPersistedRect | null>
    } = {
      persistedFrame: persistedStylingFrame
    }
    if (input.floatingWindowZLayer !== undefined) {
      frameOptions.floatingWindowZLayer = input.floatingWindowZLayer
    }

    const frame = deps.useFaFloatingWindowFrame(stylingState.windowModel, undefined, frameOptions)

    deps.useWindowStylingFramePersist({
      h: frame.h,
      w: frame.w,
      windowModel: stylingState.windowModel,
      x: frame.x,
      y: frame.y
    })

    if (input.onSurfaceWired !== undefined) {
      input.onSurfaceWired(stylingState)
    }

    const helpMenu = deps.useWindowStylingHelpMenu()

    const frameStyleWithDialogTransition = deps.computed((): Record<string, string> => ({
      ...(frame.frameStyle.value as Record<string, string>),
      '--q-transition-duration': `${deps.FA_FLOATING_WINDOW_POP_TRANSITION_MS}ms`
    }))

    const helpPanel = deps.useWindowStylingHelpPanel(helpMenu.helpKeybindMenuOpen)

    return buildWindowStylingSurfaceReturn({
      FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS: deps.FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
      FA_FLOATING_WINDOW_POP_TRANSITION_MS: deps.FA_FLOATING_WINDOW_POP_TRANSITION_MS,
      buildFaColorVarSwatchStyle: deps.buildFaColorVarSwatchStyle,
      frame,
      frameStyleWithDialogTransition,
      helpMenu,
      helpPanel,
      stylingState
    })
  }

  const useWindowStylingSurfaceOut = useWindowStylingSurface

  return {
    useWindowStylingSurface: useWindowStylingSurfaceOut
  }
}
