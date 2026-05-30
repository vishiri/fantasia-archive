import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'
import type { StoreGeneric } from 'app/types/I_vuePiniaInjected'

export function createErrorNotFound (deps: {
  S_FaActiveProject: () => StoreGeneric
  computed: <T>(getter: () => T) => I_computedRef<T>
  i18n: { global: { t: (key: string) => string } }
  resolveErrorNotFoundCardDetails: (t: (key: string) => string) => string
  resolveErrorNotFoundReturnButtonMarginClass: (showResume: boolean) => string
  resolveErrorNotFoundShowResumeCurrentProject: (
    hasActiveProject: boolean,
    filePath: string | undefined
  ) => boolean
  runFaAction: (
    id: 'loadExistingProject',
    payload: { filePath: string; resumeActiveSession: boolean }
  ) => void
  storeToRefs: T_piniaStoreToRefs
}): {
    errorNotFoundResumeCurrentProjectClick: (filePath: string | undefined) => void
    useErrorNotFound: () => {
      errorCardDetails: I_computedRef<string>
      onResumeCurrentProjectClick: () => void
      returnButtonMarginClass: I_computedRef<string>
      showResumeCurrentProject: I_computedRef<boolean>
    }
  } {
  function errorNotFoundResumeCurrentProjectClick (filePath: string | undefined): void {
    if (filePath === undefined || filePath.trim().length === 0) {
      return
    }

    deps.runFaAction('loadExistingProject', {
      filePath,
      resumeActiveSession: true
    })
  }

  function useErrorNotFound () {
    const activeProjectStore = deps.S_FaActiveProject()
    const { activeProject, hasActiveProject } = deps.storeToRefs(activeProjectStore)

    const errorCardDetails = deps.computed(() => {
      return deps.resolveErrorNotFoundCardDetails((key) => deps.i18n.global.t(key))
    })

    const showResumeCurrentProject = deps.computed(() => {
      return deps.resolveErrorNotFoundShowResumeCurrentProject(
        hasActiveProject.value === true,
        activeProject.value?.filePath
      )
    })

    const returnButtonMarginClass = deps.computed(() => {
      return deps.resolveErrorNotFoundReturnButtonMarginClass(showResumeCurrentProject.value)
    })

    function onResumeCurrentProjectClick (): void {
      errorNotFoundResumeCurrentProjectClick(activeProject.value?.filePath)
    }

    return {
      errorCardDetails,
      onResumeCurrentProjectClick,
      returnButtonMarginClass,
      showResumeCurrentProject
    }
  }

  return {
    errorNotFoundResumeCurrentProjectClick,
    useErrorNotFound
  }
}
