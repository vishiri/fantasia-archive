import type { I_faFloatingWindowPersistedRect } from 'app/types/I_faFloatingWindowPersistedRect'
import type { T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { I_faAppStylingStylingWindowStore } from 'app/types/I_faStylingWindowStoreFacade'
import type {
  I_FaWindowAppStylingState,
  I_WindowAppStylingSurface
} from 'app/types/I_faWindowStylingMonaco'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { Ref } from 'app/types/I_vueCompositionRefs'

export function createWindowAppStylingFramePersist (deps: {
  getFaAppStylingStore: () => I_faAppStylingStylingWindowStore
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
  return function useWindowAppStylingFramePersist (opts: {
    h: Ref<number>
    windowModel: Ref<boolean>
    w: Ref<number>
    x: Ref<number>
    y: Ref<number>
  }): void {
    const styling = deps.getFaAppStylingStore()

    deps.useFaFloatingWindowFramePersist({
      failureActionId: 'reportAppStylingPersistFailure',
      h: opts.h,
      persistFrame: async () => {
        await styling.persistAppStylingPartialSilent({
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

export function createUseWindowAppStylingSurface (deps: {
  getFaAppStylingStore: () => I_faAppStylingStylingWindowStore
  useWindowAppStyling: (props: { directInput?: T_dialogName | undefined }) => I_FaWindowAppStylingState
  useWindowStylingSurface: (input: {
    getPersistedFrame: () => I_faFloatingWindowPersistedRect | null
    stylingState: I_FaWindowAppStylingState
  }) => I_WindowAppStylingSurface
}): (props: { directInput?: T_dialogName | undefined }) => I_WindowAppStylingSurface {
  return function useWindowAppStylingSurface (props) {
    const stylingState = deps.useWindowAppStyling(props)
    const appStylingStore = deps.getFaAppStylingStore()

    return deps.useWindowStylingSurface({
      getPersistedFrame: () => appStylingStore.root?.frame ?? null,
      stylingState
    })
  }
}
