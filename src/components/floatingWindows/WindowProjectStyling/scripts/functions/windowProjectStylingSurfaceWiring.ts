import type { I_faFloatingWindowPersistedRect } from 'app/types/I_faFloatingWindowPersistedRect'
import type { I_faProjectStylingStylingWindowStore } from 'app/types/I_faStylingWindowStoreFacade'
import type { T_faActionId } from 'app/types/I_faActionManagerDomain'
import type {
  I_FaWindowAppStylingState,
  I_WindowProjectStylingSurface
} from 'app/types/I_faWindowStylingMonaco'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { Ref } from 'app/types/I_vueCompositionRefs'

export function createGetFaProjectStylingStore (deps: {
  getStore: () => I_faProjectStylingStylingWindowStore
}): () => I_faProjectStylingStylingWindowStore {
  return deps.getStore
}

export function createWindowProjectStylingFramePersist (deps: {
  getFaProjectStylingStore: () => I_faProjectStylingStylingWindowStore
  useFaFloatingWindowFramePersist: (opts: {
    debounceMs?: number
    failureActionId: T_faActionId
    h: Ref<number>
    persistFrame: () => Promise<void>
    w: Ref<number>
    windowModel: Ref<boolean>
    x: Ref<number>
    y: Ref<number>
  }) => void
}): (opts: {
    h: Ref<number>
    windowModel: Ref<boolean>
    w: Ref<number>
    x: Ref<number>
    y: Ref<number>
  }) => void {
  return function useWindowProjectStylingFramePersist (opts: {
    h: Ref<number>
    windowModel: Ref<boolean>
    w: Ref<number>
    x: Ref<number>
    y: Ref<number>
  }): void {
    const styling = deps.getFaProjectStylingStore()

    deps.useFaFloatingWindowFramePersist({
      failureActionId: 'reportProjectStylingSaveFailure',
      h: opts.h,
      persistFrame: async () => {
        await styling.persistProjectStylingPartialSilent({
          frame: {
            height: opts.h.value,
            width: opts.w.value,
            x: opts.x.value,
            y: opts.y.value
          }
        })
      },
      w: opts.w,
      windowModel: opts.windowModel,
      x: opts.x,
      y: opts.y
    })
  }
}

export function createUseWindowProjectStylingSurface (deps: {
  getFaProjectStylingStore: () => I_faProjectStylingStylingWindowStore
  useWindowProjectStyling: (props: { directInput?: T_dialogName | undefined }) => I_FaWindowAppStylingState
  useWindowProjectStylingCssPersist: (opts: { css: Ref<string>; windowModel: Ref<boolean> }) => void
  useWindowStylingSurface: (input: {
    floatingWindowZLayer?: 'projectStyling' | 'standard'
    getPersistedFrame: () => I_faFloatingWindowPersistedRect | null
    onSurfaceWired?: (stylingState: I_FaWindowAppStylingState) => void
    stylingState: I_FaWindowAppStylingState
  }) => I_WindowProjectStylingSurface
}): (props: { directInput?: T_dialogName | undefined }) => I_WindowProjectStylingSurface {
  return function useWindowProjectStylingSurface (props) {
    const stylingState = deps.useWindowProjectStyling(props)
    const projectStylingStore = deps.getFaProjectStylingStore()

    return deps.useWindowStylingSurface({
      floatingWindowZLayer: 'projectStyling',
      getPersistedFrame: () => projectStylingStore.root?.frame ?? null,
      onSurfaceWired: (state) => {
        deps.useWindowProjectStylingCssPersist({
          css: state.workingCss,
          windowModel: state.windowModel
        })
      },
      stylingState
    })
  }
}
