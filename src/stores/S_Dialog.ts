import type { Ref } from 'vue'
import { T_documentList } from 'app/types/T_documentList'
import { T_dialogList } from 'app/types/T_dialogList'

import { v4 as uuidv4 } from 'uuid'

import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * This store manages the state of the markdown document dialogs in the application.
 */
export const S_DialogMarkdown = defineStore('S_DialogMarkdown', () => {
  const documentToOpen: Ref<T_documentList> = ref('license')

  const dialogUUID: Ref<string> = ref('')

  function generateDialogUUID () {
    dialogUUID.value = uuidv4()
  }

  return { documentToOpen, dialogUUID, generateDialogUUID }
})()

/**
 * This store manages the state of the component dialogs in the application.
 */
export const S_DialogComponent = defineStore('S_DialogComponent', () => {
  const dialogToOpen: Ref<T_dialogList> = ref('AboutFantasiaArchive')

  const dialogUUID: Ref<string> = ref('')

  function generateDialogUUID () {
    dialogUUID.value = uuidv4()
  }

  return { dialogToOpen, dialogUUID, generateDialogUUID }
})()
