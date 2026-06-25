import type {
  T_faWindowNoteboardFactoryApi,
  T_faWindowNoteboardFactoryDeps,
  T_faWindowNoteboardFactoryParts
} from 'app/types/I_faWindowNoteboardFactoryBind'

export function bindNoteboardFactory (deps: {
  createAssembledWindowNoteboard: (input: {
    computed: T_faWindowNoteboardFactoryDeps['computed']
    deps: T_faWindowNoteboardFactoryDeps
    parts: T_faWindowNoteboardFactoryParts
  }) => T_faWindowNoteboardFactoryApi
  parts: T_faWindowNoteboardFactoryParts
}) {
  return (factoryDeps: T_faWindowNoteboardFactoryDeps): T_faWindowNoteboardFactoryApi =>
    deps.createAssembledWindowNoteboard({
      computed: factoryDeps.computed,
      deps: factoryDeps,
      parts: deps.parts
    })
}
