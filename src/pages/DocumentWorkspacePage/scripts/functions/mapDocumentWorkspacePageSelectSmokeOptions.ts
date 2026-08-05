import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'
import type { I_faProjectDocumentTemplate } from 'app/types/I_faProjectDocumentTemplateDomain'
import type { I_faSelectInputObjectItem } from 'app/types/I_faSelectInput'

/**
 * Map project document templates to FaSelectInput otherType options.
 */
export function mapDocumentWorkspacePageSelectSmokeTemplateOptions (
  templates: readonly I_faProjectDocumentTemplate[]
): I_faSelectInputObjectItem[] {
  return templates.map((template) => {
    const item: I_faSelectInputObjectItem = {
      id: template.id,
      name: template.displayName,
      otherType: 'documentTemplate'
    }
    if (template.icon.length > 0) {
      item.icon = template.icon
    }
    return item
  })
}

/**
 * Map project documents to FaSelectInput document options (icon from template when known).
 */
export function mapDocumentWorkspacePageSelectSmokeDocumentOptions (
  documents: readonly I_faProjectDocument[],
  templateIconById: ReadonlyMap<string, string>
): I_faSelectInputObjectItem[] {
  return documents.map((document) => {
    const item: I_faSelectInputObjectItem = {
      id: document.id,
      name: document.displayName
    }
    if (document.templateId !== null) {
      item.documentType = document.templateId
      const icon = templateIconById.get(document.templateId)
      if (icon !== undefined && icon.length > 0) {
        item.icon = icon
      }
    }
    return item
  })
}
