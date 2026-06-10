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
  I_faProjectDocumentTemplatePatch
} from 'app/types/I_faProjectDocumentTemplateDomain'
import type {
  I_faProjectDocumentMediaListResult,
  I_faProjectDocumentMediaLinkInput,
  I_faProjectDocumentTemplateWorldListResult,
  I_faProjectSetDocumentTemplateInput,
  I_faProjectSetDocumentWorldInput,
  I_faProjectWorldDocumentTemplateLinkInput,
  I_faProjectWorldDocumentTemplateListResult,
  I_faProjectWorldMediaLinkInput,
  I_faProjectWorldMediaListResult
} from 'app/types/I_faProjectContentLinksDomain'
import type {
  I_faProjectMedia,
  I_faProjectMediaCreateInput,
  I_faProjectMediaListResult,
  I_faProjectMediaPatch
} from 'app/types/I_faProjectMediaDomain'
import type {
  I_faProjectWorld,
  I_faProjectWorldCreateInput,
  I_faProjectWorldListResult,
  I_faProjectWorldPatch
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
  linkWorldDocumentTemplate: (input: I_faProjectWorldDocumentTemplateLinkInput) => Promise<void>
  linkWorldMedia: (input: I_faProjectWorldMediaLinkInput) => Promise<void>
  listDocumentMedia: (documentId: string) => Promise<I_faProjectDocumentMediaListResult>
  listDocumentTemplatesForWorld: (
    worldId: string
  ) => Promise<I_faProjectWorldDocumentTemplateListResult>
  listDocuments: (filter?: I_faProjectDocumentListFilter) => Promise<I_faProjectDocumentListResult>
  listDocumentTemplates: () => Promise<I_faProjectDocumentTemplateListResult>
  listMedia: () => Promise<I_faProjectMediaListResult>
  listMediaForWorld: (worldId: string) => Promise<I_faProjectWorldMediaListResult>
  listWorlds: () => Promise<I_faProjectWorldListResult>
  listWorldsForDocumentTemplate: (
    documentTemplateId: string
  ) => Promise<I_faProjectDocumentTemplateWorldListResult>
  setDocumentTemplate: (input: I_faProjectSetDocumentTemplateInput) => Promise<I_faProjectDocument>
  setDocumentWorld: (input: I_faProjectSetDocumentWorldInput) => Promise<I_faProjectDocument>
  unlinkDocumentMedia: (input: I_faProjectDocumentMediaLinkInput) => Promise<void>
  unlinkWorldDocumentTemplate: (input: I_faProjectWorldDocumentTemplateLinkInput) => Promise<void>
  unlinkWorldMedia: (input: I_faProjectWorldMediaLinkInput) => Promise<void>
  updateDocument: (id: string, patch: I_faProjectDocumentPatch) => Promise<I_faProjectDocument>
  updateDocumentTemplate: (
    id: string,
    patch: I_faProjectDocumentTemplatePatch
  ) => Promise<I_faProjectDocumentTemplate>
  updateMedia: (id: string, patch: I_faProjectMediaPatch) => Promise<I_faProjectMedia>
  updateWorld: (id: string, patch: I_faProjectWorldPatch) => Promise<I_faProjectWorld>
}
