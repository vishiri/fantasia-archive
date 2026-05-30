import type { Ref } from 'vue'
import type { T_documentName } from 'app/types/T_appDialogsAndDocuments'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

import { v4 as uuidv4 } from 'uuid'

import { defineStore } from 'pinia'
import { ref } from 'vue'

import {
  decrementDialogOpenCountNonNegative,
  incrementDialogOpenCount
} from './functions/dialogOpenCount'

/**
 * This store manages the state of the markdown document dialogs in the application.
 */
export const S_DialogMarkdown = defineStore('S_DialogMarkdown', () => {
  const documentToOpen: Ref<T_documentName> = ref('license')

  const dialogUUID: Ref<string> = ref('')

  const markdownDialogOpenCount = ref(0)

  function generateDialogUUID () {
    dialogUUID.value = uuidv4()
  }

  function onMarkdownDialogBecameVisible (): void {
    markdownDialogOpenCount.value = incrementDialogOpenCount(markdownDialogOpenCount.value)
  }

  function onMarkdownDialogBecameHidden (): void {
    markdownDialogOpenCount.value = decrementDialogOpenCountNonNegative(markdownDialogOpenCount.value)
  }

  return {
    dialogUUID,
    documentToOpen,
    generateDialogUUID,
    markdownDialogOpenCount,
    onMarkdownDialogBecameHidden,
    onMarkdownDialogBecameVisible
  }
})

/**
 * This store manages the state of the component dialogs in the application.
 */
export const S_DialogComponent = defineStore('S_DialogComponent', () => {
  const dialogToOpen: Ref<T_dialogName> = ref('AboutFantasiaArchive')

  const dialogUUID: Ref<string> = ref('')

  const componentDialogOpenCount = ref(0)

  function generateDialogUUID () {
    dialogUUID.value = uuidv4()
  }

  function onComponentDialogBecameVisible (): void {
    componentDialogOpenCount.value = incrementDialogOpenCount(componentDialogOpenCount.value)
  }

  function onComponentDialogBecameHidden (): void {
    componentDialogOpenCount.value = decrementDialogOpenCountNonNegative(componentDialogOpenCount.value)
  }

  return {
    componentDialogOpenCount,
    dialogToOpen,
    dialogUUID,
    generateDialogUUID,
    onComponentDialogBecameHidden,
    onComponentDialogBecameVisible
  }
})
