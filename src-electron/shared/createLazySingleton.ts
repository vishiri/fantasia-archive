/**
 * Returns a getter that invokes factory once and caches the result.
 */
export function createLazySingleton<T> (factory: () => T): () => T {
  let instance: T | null = null

  const get = (): T => {
    if (instance === null) {
      instance = factory()
    }
    return instance
  }

  return get
}
