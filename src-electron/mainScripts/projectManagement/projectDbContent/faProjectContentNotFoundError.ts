/** Thrown when a project content row id does not exist in the active '.faproject' database. */
export class FaProjectContentNotFoundError extends Error {
  constructor (entityLabel: string, id: string) {
    super(`${entityLabel} not found: ${id}`)
    this.name = 'FaProjectContentNotFoundError'
  }
}
