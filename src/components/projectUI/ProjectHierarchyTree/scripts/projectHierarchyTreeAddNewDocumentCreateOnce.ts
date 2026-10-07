import { reportFaTemporaryDocumentCreateFailure } from 'app/src/scripts/openedDocuments/reportFaTemporaryDocumentCreateFailureWiring'

type T_projectHierarchyTreeAddNewDocumentCreateInput = {
  openMode: string
  placementId?: string | null | undefined
  templateId: string
  worldId: string
}

const addNewDocumentCreateInFlight = new Set<string>()

function addNewDocumentCreateKey (
  input: T_projectHierarchyTreeAddNewDocumentCreateInput,
  inFlightScope: string
): string {
  const placementId = input.placementId ?? ''
  return `${input.worldId}::${input.templateId}::${placementId}::${input.openMode}::${inFlightScope}`
}

export function startProjectHierarchyTreeAddNewDocumentCreate<T extends T_projectHierarchyTreeAddNewDocumentCreateInput> (
  createTemporaryDocument: (input: T) => Promise<string>,
  input: T,
  inFlightScope = ''
): void {
  const key = addNewDocumentCreateKey(input, inFlightScope)
  if (addNewDocumentCreateInFlight.has(key)) {
    return
  }
  addNewDocumentCreateInFlight.add(key)
  void createTemporaryDocument(input).catch((error: unknown) => {
    reportFaTemporaryDocumentCreateFailure(error)
  }).finally(() => {
    addNewDocumentCreateInFlight.delete(key)
  })
}
