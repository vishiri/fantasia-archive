import type { I_computedRef } from 'app/types/I_vueCompositionShims'

type T_projectAppControlBarI18nTooltips = {
  addNewDocumentUnderThisTooltip: I_computedRef<string>
  advancedSearchGuideTooltip: I_computedRef<string>
  copyCurrentDocumentTooltip: I_computedRef<string>
  deleteCurrentDocumentTooltip: I_computedRef<string>
  editDocumentTooltip: I_computedRef<string>
  keyboardShortcutsTooltip: I_computedRef<string>
  quickAddTooltip: I_computedRef<string>
  quickSearchTooltip: I_computedRef<string>
  saveDocumentKeepEditModeTooltip: I_computedRef<string>
  saveDocumentTooltip: I_computedRef<string>
  tipsTricksTriviaTooltip: I_computedRef<string>
  toggleAppNoteboardTooltip: I_computedRef<string>
  toggleHierarchyTreeTooltip: I_computedRef<string>
  toggleProjectNoteboardTooltip: I_computedRef<string>
}

export function createProjectAppControlBarI18nTooltips (deps: {
  computed: <T>(getter: () => T) => I_computedRef<T>
  useI18n: () => {
    t: (key: string) => string
  }
}): () => T_projectAppControlBarI18nTooltips {
  return function useProjectAppControlBarI18nTooltips () {
    const { t } = deps.useI18n()

    const deleteCurrentDocumentTooltip = deps.computed(() => {
      return t('projectUI.projectAppControlBar.deleteCurrentDocumentTooltip')
    })

    const editDocumentTooltip = deps.computed(() => {
      return t('projectUI.projectAppControlBar.editDocumentTooltip')
    })

    const copyCurrentDocumentTooltip = deps.computed(() => {
      return t('projectUI.projectAppControlBar.copyCurrentDocumentTooltip')
    })

    const addNewDocumentUnderThisTooltip = deps.computed(() => {
      return t('projectUI.projectAppControlBar.addNewDocumentUnderThisTooltip')
    })

    const saveDocumentKeepEditModeTooltip = deps.computed(() => {
      return t('projectUI.projectAppControlBar.saveDocumentKeepEditModeTooltip')
    })

    const saveDocumentTooltip = deps.computed(() => {
      return t('projectUI.projectAppControlBar.saveDocumentTooltip')
    })

    const keyboardShortcutsTooltip = deps.computed(() => {
      return t('projectUI.projectAppControlBar.keyboardShortcutsTooltip')
    })

    const advancedSearchGuideTooltip = deps.computed(() => {
      return t('projectUI.projectAppControlBar.advancedSearchGuideTooltip')
    })

    const tipsTricksTriviaTooltip = deps.computed(() => {
      return t('projectUI.projectAppControlBar.tipsTricksTriviaTooltip')
    })

    const toggleHierarchyTreeTooltip = deps.computed(() => {
      return t('projectUI.projectAppControlBar.toggleHierarchyTreeTooltip')
    })

    const toggleAppNoteboardTooltip = deps.computed(() => {
      return t('projectUI.projectAppControlBar.toggleAppNoteboardTooltip')
    })

    const toggleProjectNoteboardTooltip = deps.computed(() => {
      return t('projectUI.projectAppControlBar.toggleProjectNoteboardTooltip')
    })

    const quickSearchTooltip = deps.computed(() => {
      return t('projectUI.projectAppControlBar.quickSearchTooltip')
    })

    const quickAddTooltip = deps.computed(() => {
      return t('projectUI.projectAppControlBar.quickAddTooltip')
    })

    return {
      addNewDocumentUnderThisTooltip,
      advancedSearchGuideTooltip,
      copyCurrentDocumentTooltip,
      deleteCurrentDocumentTooltip,
      editDocumentTooltip,
      keyboardShortcutsTooltip,
      quickAddTooltip,
      quickSearchTooltip,
      saveDocumentKeepEditModeTooltip,
      saveDocumentTooltip,
      tipsTricksTriviaTooltip,
      toggleAppNoteboardTooltip,
      toggleHierarchyTreeTooltip,
      toggleProjectNoteboardTooltip
    }
  }
}
