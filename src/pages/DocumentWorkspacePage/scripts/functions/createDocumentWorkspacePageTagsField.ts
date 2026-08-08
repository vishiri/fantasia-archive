import type { T_createUseDocumentWorkspacePageDeps } from 'app/types/I_documentWorkspacePage'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectDocumentTagAssignmentInput } from 'app/types/I_faProjectTagDomain'
import type { I_faSelectInputObjectItem } from 'app/types/I_faSelectInput'
import type { I_computedRef, I_ref, I_writableComputedRef } from 'app/types/I_vueCompositionShims'

export function createDocumentWorkspacePageTagsField (deps: {
  computed: T_createUseDocumentWorkspacePageDeps['computed']
  documentTab: I_computedRef<I_faOpenedDocumentTab | null>
  i18n: T_createUseDocumentWorkspacePageDeps['i18n']
  listTagsForWorld: (worldId: string) => Promise<I_faSelectInputObjectItem[]>
  ref: <T>(value: T) => I_ref<T>
  resolveOpenedDocumentTabIsInPreviewMode: T_createUseDocumentWorkspacePageDeps['resolveOpenedDocumentTabIsInPreviewMode']
  routeDocumentId: I_computedRef<string>
  updateTagsDraft: (documentId: string, value: I_faProjectDocumentTagAssignmentInput[]) => void
}): {
    onTagsRequestOptions: () => void
    tagsFieldDescription: I_computedRef<string>
    tagsFieldLabel: I_computedRef<string>
    tagsFieldReadOnly: I_computedRef<boolean>
    tagsModel: I_writableComputedRef<I_faSelectInputObjectItem[]>
    tagsOptions: I_ref<I_faSelectInputObjectItem[]>
  } {
  const tagsOptions = deps.ref<I_faSelectInputObjectItem[]>([])

  const tagsFieldLabel = deps.computed(() => {
    return deps.i18n.global.t('documentWorkspacePage.tagsFieldLabel')
  })

  const tagsFieldDescription = deps.computed(() => {
    return deps.i18n.global.t('documentWorkspacePage.tagsFieldDescription')
  })

  const tagsFieldReadOnly = deps.computed(() => {
    const tab = deps.documentTab.value
    if (tab === null) {
      return true
    }
    return deps.resolveOpenedDocumentTabIsInPreviewMode(tab.editState)
  })

  const tagsModel: I_writableComputedRef<I_faSelectInputObjectItem[]> = deps.computed({
    get (): I_faSelectInputObjectItem[] {
      return (deps.documentTab.value?.tagsDraft ?? []).map((tag) => {
        return {
          id: tag.id,
          name: tag.name,
          ...(tag.isNew === true ? { isNew: true } : {})
        }
      })
    },
    set (value: I_faSelectInputObjectItem[]) {
      if (deps.routeDocumentId.value.length === 0 || tagsFieldReadOnly.value) {
        return
      }
      const nextDraft: I_faProjectDocumentTagAssignmentInput[] = value.map((item) => {
        const assignment: I_faProjectDocumentTagAssignmentInput = {
          id: item.id,
          name: item.name
        }
        if (item.isNew === true) {
          assignment.isNew = true
        }
        return assignment
      })
      deps.updateTagsDraft(deps.routeDocumentId.value, nextDraft)
    }
  })

  function onTagsRequestOptions (): void {
    const worldId = deps.documentTab.value?.worldId
    if (worldId === undefined || worldId.length === 0) {
      tagsOptions.value = []
      return
    }
    void deps.listTagsForWorld(worldId).then((items) => {
      tagsOptions.value = items
    })
  }

  return {
    onTagsRequestOptions,
    tagsFieldDescription,
    tagsFieldLabel,
    tagsFieldReadOnly,
    tagsModel,
    tagsOptions
  }
}
