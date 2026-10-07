import type { T_createUseDocumentWorkspacePageDeps } from 'app/types/I_documentWorkspacePage'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectDocumentTagAssignmentInput } from 'app/types/I_faProjectTagDomain'
import type { I_faSelectInputObjectItem } from 'app/types/I_faSelectInput'
import type { I_computedRef, I_ref, I_writableComputedRef } from 'app/types/I_vueCompositionShims'

function requestDocumentWorkspacePageTagsOptions (input: {
  documentTab: I_computedRef<I_faOpenedDocumentTab | null>
  listTagsForWorld: (worldId: string) => Promise<I_faSelectInputObjectItem[]>
  requestSerialBox: { current: number }
  tagsOptions: I_ref<I_faSelectInputObjectItem[]>
  tagsOptionsWorldId: { current: string | null }
}): void {
  const requestSerial = input.requestSerialBox.current + 1
  input.requestSerialBox.current = requestSerial
  const worldId = input.documentTab.value?.worldId
  if (worldId === undefined || worldId.length === 0) {
    input.tagsOptionsWorldId.current = null
    input.tagsOptions.value = []
    return
  }
  if (input.tagsOptionsWorldId.current !== worldId) {
    input.tagsOptionsWorldId.current = worldId
    input.tagsOptions.value = []
  }
  void input.listTagsForWorld(worldId).then((items) => {
    if (requestSerial !== input.requestSerialBox.current) {
      return
    }
    if (input.documentTab.value?.worldId !== worldId) {
      return
    }
    input.tagsOptions.value = items
  }, () => {
    if (requestSerial !== input.requestSerialBox.current) {
      return
    }
    if (input.documentTab.value?.worldId !== worldId) {
      return
    }
    input.tagsOptions.value = []
  })
}

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
  const tagsOptionsRequestSerial = {
    current: 0
  }
  const tagsOptionsWorldId = {
    current: null as string | null
  }

  const tagsFieldLabel = deps.computed(() => {
    return deps.i18n.global.t('documentWorkspacePage.tagsFieldLabel')
  })

  const tagsFieldDescription = deps.computed(() => {
    return deps.i18n.global.t('documentWorkspacePage.tagsFieldDescription')
  })

  const tagsFieldReadOnly = deps.computed(() => {
    const tab = deps.documentTab.value
    if (tab === null || tab.tagsDraft === undefined) {
      return true
    }
    return deps.resolveOpenedDocumentTabIsInPreviewMode(tab.editState)
  })

  const tagsModel: I_writableComputedRef<I_faSelectInputObjectItem[]> = deps.computed({
    get (): I_faSelectInputObjectItem[] {
      return (deps.documentTab.value?.tagsDraft ?? []).map((tag) => {
        const id = tag.id
        const name = tag.name
        if (tag.isNew === true) {
          return {
            id,
            isNew: true,
            name
          }
        }
        return {
          id,
          name
        }
      })
    },
    set (value: I_faSelectInputObjectItem[]) {
      if (deps.routeDocumentId.value.length === 0 || tagsFieldReadOnly.value) {
        return
      }
      if (deps.documentTab.value?.tagsDraft === undefined) {
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
    requestDocumentWorkspacePageTagsOptions({
      documentTab: deps.documentTab,
      listTagsForWorld: deps.listTagsForWorld,
      requestSerialBox: tagsOptionsRequestSerial,
      tagsOptions,
      tagsOptionsWorldId
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
