import type { I_faProjectDocumentTemplatesForProjectSettingsResult } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_faProjectWorldsForProjectSettingsResult } from 'app/types/I_dialogProjectSettingsWorlds'
import type {
  I_faProjectDocument,
  I_faProjectDocumentCreateInput,
  I_faProjectDocumentListFilter,
  I_faProjectDocumentListResult,
  I_faProjectDocumentPatch
} from 'app/types/I_faProjectDocumentDomain'
import type {
  I_faProjectDocumentTemplate,
  I_faProjectDocumentTemplateCreateInput,
  I_faProjectDocumentTemplateListResult,
  I_faProjectDocumentTemplatePatch,
  I_faProjectDocumentTemplateSnapshotItem
} from 'app/types/I_faProjectDocumentTemplateDomain'
import type {
  I_faProjectDocumentMediaListResult,
  I_faProjectDocumentMediaLinkInput,
  I_faProjectSetDocumentTemplateInput,
  I_faProjectSetDocumentWorldInput
} from 'app/types/I_faProjectContentLinksDomain'
import type {
  I_faProjectMedia,
  I_faProjectMediaCreateInput,
  I_faProjectMediaListResult,
  I_faProjectMediaPatch
} from 'app/types/I_faProjectMediaDomain'
import type {
  I_faProjectHierarchyTreeDocumentChild,
  I_faProjectHierarchyTreeListPlacementChildrenInput,
  I_faProjectHierarchyTreeListPlacementChildrenResult,
  I_faProjectHierarchyTreeMoveDocumentInput,
  I_faProjectHierarchyTreeReindexDocumentSiblingsInput,
  I_faProjectHierarchyTreeSearchResult,
  I_faProjectHierarchyTreeWorkspaceLayoutResult
} from 'app/types/I_faProjectHierarchyTreeDomain'
import type {
  I_faProjectWorld,
  I_faProjectWorldCreateInput,
  I_faProjectWorldListResult,
  I_faProjectWorldPatch,
  I_faProjectWorldSnapshotItem
} from 'app/types/I_faProjectWorldDomain'

/**
 * Preload API for worldbuilding rows in the active '.faproject' SQLite database.
 */
export interface I_faProjectContentAPI {
  createDocument: (input: I_faProjectDocumentCreateInput) => Promise<I_faProjectDocument>
  createDocumentTemplate: (
    input: I_faProjectDocumentTemplateCreateInput
  ) => Promise<I_faProjectDocumentTemplate>
  createMedia: (input: I_faProjectMediaCreateInput) => Promise<I_faProjectMedia>
  createWorld: (input: I_faProjectWorldCreateInput) => Promise<I_faProjectWorld>
  deleteDocument: (id: string) => Promise<void>
  deleteDocumentTemplate: (id: string) => Promise<void>
  deleteMedia: (id: string) => Promise<void>
  deleteWorld: (id: string) => Promise<void>
  getDocumentById: (id: string) => Promise<I_faProjectDocument>
  getDocumentTemplateById: (id: string) => Promise<I_faProjectDocumentTemplate>
  getMediaById: (id: string) => Promise<I_faProjectMedia>
  getWorldById: (id: string) => Promise<I_faProjectWorld>
  linkDocumentMedia: (input: I_faProjectDocumentMediaLinkInput) => Promise<void>
  listDocumentMedia: (documentId: string) => Promise<I_faProjectDocumentMediaListResult>
  listDocuments: (filter?: I_faProjectDocumentListFilter) => Promise<I_faProjectDocumentListResult>
  listDocumentTemplates: () => Promise<I_faProjectDocumentTemplateListResult>
  listDocumentTemplatesForProjectSettings: () => Promise<I_faProjectDocumentTemplatesForProjectSettingsResult>
  listMedia: () => Promise<I_faProjectMediaListResult>
  listWorlds: () => Promise<I_faProjectWorldListResult>
  listWorldsForProjectSettings: () => Promise<I_faProjectWorldsForProjectSettingsResult>
  listWorkspaceHierarchyLayout: () => Promise<I_faProjectHierarchyTreeWorkspaceLayoutResult>
  listPlacementDocumentChildren: (
    input: I_faProjectHierarchyTreeListPlacementChildrenInput
  ) => Promise<I_faProjectHierarchyTreeListPlacementChildrenResult>
  moveDocumentInHierarchy: (
    input: I_faProjectHierarchyTreeMoveDocumentInput
  ) => Promise<I_faProjectHierarchyTreeDocumentChild>
  reindexDocumentSiblingsInHierarchy: (
    input: I_faProjectHierarchyTreeReindexDocumentSiblingsInput
  ) => Promise<I_faProjectHierarchyTreeDocumentChild>
  searchProjectHierarchy: (query: string) => Promise<I_faProjectHierarchyTreeSearchResult>
  saveDocumentTemplatesSnapshot: (items: I_faProjectDocumentTemplateSnapshotItem[]) => Promise<void>
  saveWorldsSnapshot: (items: I_faProjectWorldSnapshotItem[]) => Promise<void>
  setDocumentTemplate: (input: I_faProjectSetDocumentTemplateInput) => Promise<I_faProjectDocument>
  setDocumentWorld: (input: I_faProjectSetDocumentWorldInput) => Promise<I_faProjectDocument>
  unlinkDocumentMedia: (input: I_faProjectDocumentMediaLinkInput) => Promise<void>
  updateDocument: (id: string, patch: I_faProjectDocumentPatch) => Promise<I_faProjectDocument>
  updateDocumentTemplate: (
    id: string,
    patch: I_faProjectDocumentTemplatePatch
  ) => Promise<I_faProjectDocumentTemplate>
  updateMedia: (id: string, patch: I_faProjectMediaPatch) => Promise<I_faProjectMedia>
  updateWorld: (id: string, patch: I_faProjectWorldPatch) => Promise<I_faProjectWorld>
}
