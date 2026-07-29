import type { I_faRecentProjectEntry } from 'app/types/I_faRecentProjectsDomain'
import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'
import type { StoreGeneric, T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'
import type { T_vueWatch } from 'app/types/I_vueWatchInjected'

type T_splashResumePrimaryLabelKey =
  'splashPage.resumeCurrentProject' | 'splashPage.resumeLatestProject'

type T_splashResumePrimaryBusyHoldApi = {
  beginResumePrimaryBusyHold: (activeProject: { filePath?: string } | null) => void
  clearResumePrimaryBusyTimer: () => void
  resumePrimaryBusy: I_ref<boolean>
  resumePrimaryLabelHoldKey: I_ref<T_splashResumePrimaryLabelKey | null>
}

type T_createSplashControlsResumeDropdownDeps = {
  FA_USER_SETTINGS_DEFAULTS: { hideRecentProjectTooltip: boolean }
  S_FaActiveProject: () => StoreGeneric
  S_FaRecentProjects: () => StoreGeneric
  S_FaUserSettings: () => StoreGeneric
  computed: <T>(getter: () => T) => I_computedRef<T>
  createSplashResumePrimaryBusyHold: (deps: {
    clearTimeout: (id: number) => void
    ref: <T>(value: T) => I_ref<T>
    resumePrimaryBusyHoldMs: number
    setTimeout: (handler: () => void, timeout: number) => number
  }) => T_splashResumePrimaryBusyHoldApi
  clearTimeout: (id: number) => void
  i18n: { global: { t: (key: string) => string; locale: { value: string } } }
  nextTick: (fn?: () => void | Promise<void>) => Promise<void>
  onMounted: (hook: () => void) => void
  onUnmounted: (hook: () => void) => void
  openWelcomeScreenAutoLoadProject: () => void
  ref: <T>(value: T) => I_ref<T>
  resolveSplashResumeDropdownArrowElement: (
    instance: { $el?: unknown } | null,
    tooltipText: string
  ) => HTMLElement | null
  resolveSplashResumeDropdownPrimaryElement: (
    instance: { $el?: unknown } | null
  ) => HTMLElement | null
  resolveSplashResumePrimaryLabelKey: (
    activeProject: { filePath?: string } | null
  ) => T_splashResumePrimaryLabelKey
  resumePrimaryBusyHoldMs: number
  runFaAction: (
    id: 'loadExistingProject',
    payload: { filePath: string } | { filePath: string; resumeActiveSession: boolean }
  ) => void
  setTimeout: (handler: () => void, timeout: number) => number
  splashRecentProjectRowTestLocator: (index: number) => string
  storeToRefs: T_piniaStoreToRefs
  watch: T_vueWatch
}

function syncSplashControlsResumeDropdownArrowTarget (
  deps: T_createSplashControlsResumeDropdownDeps,
  params: {
    hasRecentProjects: I_computedRef<boolean>
    hideRecentProjectTooltip: I_computedRef<boolean>
    resumeDropdownArrowEl: I_ref<HTMLElement | null>
    resumeDropdownRef: I_ref<{ $el?: unknown } | null>
  }
): void {
  const {
    hasRecentProjects,
    hideRecentProjectTooltip,
    resumeDropdownArrowEl,
    resumeDropdownRef
  } = params

  if (hasRecentProjects.value !== true) {
    resumeDropdownArrowEl.value = null
    return
  }

  void deps.nextTick(() => {
    deps.resolveSplashResumeDropdownPrimaryElement(resumeDropdownRef.value)

    if (hideRecentProjectTooltip.value === true) {
      resumeDropdownArrowEl.value = null
      return
    }

    const tooltipText = deps.i18n.global.t('splashPage.browseLatestProjects')
    resumeDropdownArrowEl.value = deps.resolveSplashResumeDropdownArrowElement(
      resumeDropdownRef.value,
      tooltipText
    )
  })
}

function splashControlsOnLoadRecentProjectByPath (
  deps: T_createSplashControlsResumeDropdownDeps,
  filePath: string
): void {
  deps.runFaAction('loadExistingProject', { filePath })
}

function splashControlsOnResumePrimarySegmentClick (
  deps: T_createSplashControlsResumeDropdownDeps,
  activeProject: I_ref<{ filePath?: string } | null>
): void {
  const sessionFilePath = activeProject.value?.filePath
  if (sessionFilePath !== undefined && sessionFilePath.length > 0) {
    deps.runFaAction('loadExistingProject', {
      filePath: sessionFilePath,
      resumeActiveSession: true
    })
    return
  }

  deps.openWelcomeScreenAutoLoadProject()
}

function wireSplashControlsResumeDropdownWatches (
  deps: T_createSplashControlsResumeDropdownDeps,
  params: {
    activeProject: I_ref<{ filePath?: string } | null>
    hasRecentProjects: I_computedRef<boolean>
    hideRecentProjectTooltip: I_computedRef<boolean>
    recentProjectEntries: I_ref<I_faRecentProjectEntry[]>
    syncResumeDropdownArrowTarget: () => void
  }
): void {
  const {
    activeProject,
    hasRecentProjects,
    hideRecentProjectTooltip,
    recentProjectEntries,
    syncResumeDropdownArrowTarget
  } = params

  deps.watch(() => hasRecentProjects.value, () => {
    syncResumeDropdownArrowTarget()
  }, { flush: 'post' })

  deps.watch(() => hideRecentProjectTooltip.value, () => {
    syncResumeDropdownArrowTarget()
  }, { flush: 'post' })

  deps.watch(() => activeProject.value, () => {
    syncResumeDropdownArrowTarget()
  }, { flush: 'post' })

  deps.watch(() => recentProjectEntries.value.length, () => {
    syncResumeDropdownArrowTarget()
  }, { flush: 'post' })

  deps.watch(() => deps.i18n.global.locale.value, () => {
    syncResumeDropdownArrowTarget()
  }, { flush: 'post' })
}

function useSplashControlsResumeDropdown (deps: T_createSplashControlsResumeDropdownDeps): {
  hasRecentProjects: I_computedRef<boolean>
  hideRecentProjectTooltip: I_computedRef<boolean>
  onLoadRecentProjectByPath: (filePath: string) => void
  onResumePrimarySegmentClick: () => void
  recentProjectEntries: I_ref<I_faRecentProjectEntry[]>
  resumeDropdownArrowEl: I_ref<HTMLElement | null>
  resumeDropdownArrowTarget: I_computedRef<Element | undefined>
  resumeDropdownRef: I_ref<{ $el?: unknown } | null>
  resumePrimaryBusy: I_ref<boolean>
  resumePrimarySegmentLabel: I_computedRef<string>
  showResumeDropdownArrowTooltip: I_computedRef<boolean>
  splashRecentProjectRowTestLocator: (index: number) => string
} {
  const resumeDropdownRef = deps.ref<{ $el?: unknown } | null>(null)
  const resumeDropdownArrowEl = deps.ref<HTMLElement | null>(null)
  const activeProjectStore = deps.S_FaActiveProject()
  const activeProject = deps.storeToRefs(activeProjectStore).activeProject!
  const faUserSettingsStore = deps.S_FaUserSettings()
  const faUserSettings = deps.storeToRefs(faUserSettingsStore).settings!
  const recentProjectsStore = deps.S_FaRecentProjects()
  const recentProjectEntries = deps.storeToRefs(recentProjectsStore).entries!
  const {
    beginResumePrimaryBusyHold,
    clearResumePrimaryBusyTimer,
    resumePrimaryBusy,
    resumePrimaryLabelHoldKey
  } = deps.createSplashResumePrimaryBusyHold({
    clearTimeout: deps.clearTimeout,
    ref: deps.ref,
    resumePrimaryBusyHoldMs: deps.resumePrimaryBusyHoldMs,
    setTimeout: deps.setTimeout
  })

  const hideRecentProjectTooltip = deps.computed(() => {
    return faUserSettings.value?.hideRecentProjectTooltip ??
      deps.FA_USER_SETTINGS_DEFAULTS.hideRecentProjectTooltip
  })

  const hasRecentProjects = deps.computed(() => {
    return recentProjectEntries.value.length > 0
  })

  const showResumeDropdownArrowTooltip = deps.computed(() => {
    if (hideRecentProjectTooltip.value === true) {
      return false
    }
    return resumeDropdownArrowEl.value !== null
  })

  const resumeDropdownArrowTarget = deps.computed((): Element | undefined => {
    return resumeDropdownArrowEl.value ?? undefined
  })

  const resumePrimarySegmentLabel = deps.computed(() => {
    const labelKey = resumePrimaryLabelHoldKey.value ??
      deps.resolveSplashResumePrimaryLabelKey(activeProject.value)
    return deps.i18n.global.t(labelKey)
  })

  const syncResumeDropdownArrowTarget = (): void => {
    syncSplashControlsResumeDropdownArrowTarget(deps, {
      hasRecentProjects,
      hideRecentProjectTooltip,
      resumeDropdownArrowEl,
      resumeDropdownRef
    })
  }

  wireSplashControlsResumeDropdownWatches(deps, {
    activeProject,
    hasRecentProjects,
    hideRecentProjectTooltip,
    recentProjectEntries,
    syncResumeDropdownArrowTarget
  })

  const onLoadRecentProjectByPath = (filePath: string): void => {
    splashControlsOnLoadRecentProjectByPath(deps, filePath)
  }

  const onResumePrimarySegmentClick = (): void => {
    if (resumePrimaryBusy.value === true) {
      return
    }
    beginResumePrimaryBusyHold(activeProject.value)
    splashControlsOnResumePrimarySegmentClick(deps, activeProject)
  }

  deps.onMounted(() => {
    void recentProjectsStore.refreshRecentProjects().then(syncResumeDropdownArrowTarget)
  })

  deps.onUnmounted(clearResumePrimaryBusyTimer)

  return {
    hasRecentProjects,
    hideRecentProjectTooltip,
    onLoadRecentProjectByPath,
    onResumePrimarySegmentClick,
    recentProjectEntries,
    resumeDropdownArrowEl,
    resumeDropdownArrowTarget,
    resumeDropdownRef,
    resumePrimaryBusy,
    resumePrimarySegmentLabel,
    showResumeDropdownArrowTooltip,
    splashRecentProjectRowTestLocator: deps.splashRecentProjectRowTestLocator
  }
}

export function createSplashControlsResumeDropdown (deps: T_createSplashControlsResumeDropdownDeps): {
  useSplashControlsResumeDropdown: () => ReturnType<typeof useSplashControlsResumeDropdown>
} {
  return {
    useSplashControlsResumeDropdown: () => useSplashControlsResumeDropdown(deps)
  }
}
