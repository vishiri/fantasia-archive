import { onUnmounted, watch } from 'vue'

import { S_DialogComponent, S_DialogMarkdown } from 'app/src/stores/S_Dialog'

import { createDialogManagement } from './functions/createDialogManagement'
import { createDialogManagementDismiss } from './functions/createDialogManagementDismiss'
import { dispatchFaQuasarEscapeKeyEvent } from './dialogManagementDismissWiring'

const dialogManagementApi = createDialogManagement({
  getDialogComponentStore: () => S_DialogComponent(),
  getDialogMarkdownStore: () => S_DialogMarkdown(),
  onUnmounted,
  watch
})

const dialogManagementDismissApi = createDialogManagementDismiss({
  dispatchWindowKeyEvent: dispatchFaQuasarEscapeKeyEvent,
  getDialogComponentStore: () => S_DialogComponent(),
  getDialogMarkdownStore: () => S_DialogMarkdown()
})

export const openDialogMarkdownDocument = dialogManagementApi.openDialogMarkdownDocument

export const openDialogComponent = dialogManagementApi.openDialogComponent

export const registerComponentDialogStackGuard =
  dialogManagementApi.registerComponentDialogStackGuard

export const registerMarkdownDialogStackGuard =
  dialogManagementApi.registerMarkdownDialogStackGuard

export const dispatchFaQuasarEscapeDismiss =
  dialogManagementDismissApi.dispatchFaQuasarEscapeDismiss

export const isFaComponentDialogOpen = dialogManagementDismissApi.isFaComponentDialogOpen

export const isFaMarkdownDocumentOpen = dialogManagementDismissApi.isFaMarkdownDocumentOpen

export const tryDismissFaComponentDialogIfOpen =
  dialogManagementDismissApi.tryDismissFaComponentDialogIfOpen

export const tryDismissFaMarkdownDocumentIfOpen =
  dialogManagementDismissApi.tryDismissFaMarkdownDocumentIfOpen
