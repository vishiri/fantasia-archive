/* eslint-disable max-lines-per-function -- monolithic create factory; decompose when extracting concerns */
import type { I_appMenuBuildSession, I_appMenuList } from 'app/types/I_appMenusDataList'
import type { StoreGeneric, T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'
import type { ComputedRef, Ref } from 'app/types/I_vueCompositionRefs'
import type { T_documentName } from 'app/types/T_appDialogsAndDocuments'

export function createAppControlMenus (deps: {
  buildDocumentsMenu: (session: I_appMenuBuildSession) => I_appMenuList
  buildHelpInfoMenu: () => I_appMenuList
  buildProjectMenu: (session: I_appMenuBuildSession) => I_appMenuList
  buildToolsMenu: (session: I_appMenuBuildSession) => I_appMenuList
  computed: <T>(getter: () => T) => ComputedRef<T>
  getFaActiveProjectStore: () => StoreGeneric
  getFaRecentProjectsStore: () => StoreGeneric
  i18n: { global: { locale: { value: string } } }
  isFantasiaStorybookCanvas: () => boolean
  onMounted: (hook: () => void | Promise<void>) => void
  openDialogMarkdownDocument: (documentName: T_documentName) => void
  readAppControlMenusTestingTypeFromCachedSnapshot: (
    snap: { TEST_ENV?: string | false } | null | undefined
  ) => string | false
  ref: <T>(value: T) => Ref<T>
  storeToRefs: T_piniaStoreToRefs
}): {
    appControlMenusEmbedDialogsDefault: boolean
    useAppControlMenus: () => {
      componentTestingMenuList: I_appMenuList
      documents: ComputedRef<I_appMenuList>
      helpInfo: ComputedRef<I_appMenuList>
      project: ComputedRef<I_appMenuList>
      testingType: Ref<string | false>
      tools: ComputedRef<I_appMenuList>
    }
  } {
  function readInitialTestingType (): string | false {
    const snap = window.faContentBridgeAPIs?.extraEnvVariables?.getCachedSnapshot?.()
    return deps.readAppControlMenusTestingTypeFromCachedSnapshot(snap)
  }

  function buildComponentTestingMenuList (): I_appMenuList {
    return {
      title: 'Test Title',
      data: [
        {
          mode: 'item',
          text: 'Test Button 1 - Open Dialog with Markdown document',
          icon: 'mdi-text-box-plus-outline',
          submenu: undefined,
          trigger: () => deps.openDialogMarkdownDocument('changeLog'),
          conditions: true,
          specialColor: undefined
        },
        {
          mode: 'item',
          text: 'Test Button 2 - Keybind Settings (hint)',
          icon: 'mdi-keyboard-settings',
          keybindCommandId: 'openKeybindSettings',
          submenu: undefined,
          trigger: undefined,
          conditions: true,
          specialColor: undefined
        },
        {
          mode: 'separator'
        },
        {
          mode: 'item',
          text: 'Test Button 3 - Secondary',
          icon: 'mdi-text-box-remove-outline',
          submenu: undefined,
          trigger: undefined,
          conditions: true,
          specialColor: 'secondary'
        },
        {
          mode: 'separator'
        },
        {
          mode: 'item',
          text: 'Test Button 4',
          icon: 'mdi-page-layout-sidebar-left',
          submenu: undefined,
          trigger: undefined,
          conditions: true,
          specialColor: undefined
        },
        {
          mode: 'item',
          text: 'Test Button 5',
          icon: 'mdi-clipboard-text-outline',
          submenu: undefined,
          trigger: undefined,
          conditions: true,
          specialColor: undefined
        },
        {
          mode: 'separator'
        },
        {
          mode: 'item',
          text: 'Test Button 6 - Grey, Submenu',
          icon: 'keyboard_arrow_right',
          trigger: undefined,
          conditions: true,
          specialColor: 'grey',
          submenu: [
            {
              mode: 'item',
              text: 'Submenu-Test Button 1 - Advanced Search Guide (hint)',
              icon: 'mdi-file-question',
              keybindCommandId: 'openAdvancedSearchGuide',
              trigger: undefined,
              conditions: true,
              specialColor: undefined
            },
            {
              mode: 'separator'
            },
            {
              mode: 'item',
              text: 'Submenu-Test Button 2 - Secondary',
              icon: 'mdi-wrench',
              trigger: undefined,
              conditions: true,
              specialColor: 'secondary'
            }
          ]
        }
      ]
    }
  }

  const componentTestingMenuList = buildComponentTestingMenuList()

  function useAppControlMenus () {
    const { hasActiveProject } = deps.storeToRefs(deps.getFaActiveProjectStore())
    const { entries: recentProjectEntries } = deps.storeToRefs(deps.getFaRecentProjectsStore())

    const testingType = deps.ref<string | false>(readInitialTestingType())

    deps.onMounted(async () => {
      const bridge = window.faContentBridgeAPIs?.extraEnvVariables
      if (bridge?.getSnapshot) {
        const snap = await bridge.getSnapshot()
        testingType.value = snap.TEST_ENV ?? ''
      }
    })

    const project = deps.computed((): I_appMenuList => {
      void deps.i18n.global.locale.value
      void hasActiveProject.value
      void recentProjectEntries.value
      return deps.buildProjectMenu({
        hasActiveProject: hasActiveProject.value,
        recentProjects: recentProjectEntries.value
      })
    })

    const documents = deps.computed((): I_appMenuList => {
      void deps.i18n.global.locale.value
      void hasActiveProject.value
      return deps.buildDocumentsMenu({
        hasActiveProject: hasActiveProject.value
      })
    })

    const tools = deps.computed((): I_appMenuList => {
      void deps.i18n.global.locale.value
      void hasActiveProject.value
      return deps.buildToolsMenu({
        hasActiveProject: hasActiveProject.value
      })
    })

    const helpInfo = deps.computed((): I_appMenuList => {
      void deps.i18n.global.locale.value
      return deps.buildHelpInfoMenu()
    })

    return {
      componentTestingMenuList,
      documents,
      helpInfo,
      project,
      testingType,
      tools
    }
  }

  const appControlMenusEmbedDialogsDefault = !deps.isFantasiaStorybookCanvas()

  return {
    useAppControlMenus,
    appControlMenusEmbedDialogsDefault
  }
}
