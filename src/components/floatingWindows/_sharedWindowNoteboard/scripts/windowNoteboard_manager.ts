import { bindNoteboardFactory } from './functions/bindNoteboardFactory'
import { createAssembledWindowNoteboard } from './functions/createAssembledWindowNoteboard'
import { createWindowNoteboardFramePersist, createWindowNoteboardTextPersist, createWireWindowNoteboardDirectInput } from './functions/createWindowNoteboardPersist'
import { createWindowNoteboardUse } from './functions/createWindowNoteboardUse'

export const createWindowNoteboard = bindNoteboardFactory({
  createAssembledWindowNoteboard,
  parts: {
    createWindowNoteboardFramePersist,
    createWindowNoteboardTextPersist,
    createWindowNoteboardUse,
    createWireWindowNoteboardDirectInput
  }
})
