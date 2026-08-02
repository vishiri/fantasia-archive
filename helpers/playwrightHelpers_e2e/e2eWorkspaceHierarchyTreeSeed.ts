import type { Page } from 'playwright'

type T_e2eHierarchySeedDocumentInput = {
  displayName: string
  isCategory?: boolean
  parentDocumentId?: string | null
  sortOrder?: number
  treeOrderNumber?: number
}

type T_e2eHierarchySeedInput = {
  documents: T_e2eHierarchySeedDocumentInput[]
  placementNickname?: string
  templateDisplayName: string
  templatePluralTitle?: string
  templateSingularTitle?: string
}

/**
 * Seeds template + placement + documents in SQLite for workspace hierarchy E2E specs.
 */
export async function e2eSeedHierarchyPlacementWithDocuments (
  page: Page,
  input: T_e2eHierarchySeedInput
): Promise<{
  documents: Array<{ displayName: string, id: string }>
  placementId: string
  templateId: string
  worldId: string
}> {
  return page.evaluate(async (seedInput) => {
    const content = window.faContentBridgeAPIs?.projectContent
    if (content === undefined) {
      throw new Error('Project content bridge unavailable')
    }
    const worlds = await content.listWorlds()
    const world = worlds.items[0]
    if (world === undefined) {
      throw new Error('No default world in E2E project')
    }
    const template = await content.createDocumentTemplate({
      displayName: seedInput.templateDisplayName
    })
    const placementId = crypto.randomUUID()
    const pluralTitle = seedInput.templatePluralTitle ?? 'Characters'
    const singularTitle = seedInput.templateSingularTitle ?? 'Character'
    await content.saveDocumentTemplatesSnapshot([{
      id: template.id,
      titlePluralTranslations: { 'en-US': pluralTitle },
      titleSingularTranslations: { 'en-US': singularTitle },
      icon: 'mdi-file-document'
    }])
    await content.saveWorldsSnapshot([{
      id: world.id,
      displayNameTranslations: { 'en-US': world.displayName },
      color: world.color,
      colorPallete: world.colorPallete,
      templateLayout: {
        groups: [],
        placements: [{
          id: placementId,
          documentTemplateId: template.id,
          groupId: null,
          rootSortOrder: 0,
          groupSortOrder: null,
          nickname: seedInput.placementNickname ?? pluralTitle,
          nicknamePluralTranslations: { 'en-US': pluralTitle },
          nicknameSingularTranslations: { 'en-US': singularTitle }
        }]
      }
    }])
    const createdDocuments: Array<{ displayName: string, id: string }> = []
    for (const documentInput of seedInput.documents) {
      const createdDocument = await content.createDocument({
        displayName: documentInput.displayName,
        worldId: world.id,
        templateId: template.id,
        placementId,
        isCategory: documentInput.isCategory === true,
        parentDocumentId: documentInput.parentDocumentId ?? null,
        sortOrder: documentInput.sortOrder,
        treeOrderNumber: documentInput.treeOrderNumber
      })
      createdDocuments.push({
        displayName: createdDocument.displayName,
        id: createdDocument.id
      })
    }
    return {
      documents: createdDocuments,
      placementId,
      templateId: template.id,
      worldId: world.id
    }
  }, input)
}
