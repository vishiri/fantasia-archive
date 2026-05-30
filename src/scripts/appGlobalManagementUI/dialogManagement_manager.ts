import { onUnmounted, watch } from 'vue'

import { S_DialogComponent, S_DialogMarkdown } from 'app/src/stores/S_Dialog'

import { createDialogManagement } from './functions/createDialogManagement'

const dialogManagementApi = createDialogManagement({
  getDialogComponentStore: () => S_DialogComponent(),
  getDialogMarkdownStore: () => S_DialogMarkdown(),
  onUnmounted,
  watch
})

export const openDialogMarkdownDocument = dialogManagementApi.openDialogMarkdownDocument

export const openDialogComponent = dialogManagementApi.openDialogComponent

export const registerComponentDialogStackGuard =
  dialogManagementApi.registerComponentDialogStackGuard

export const registerMarkdownDialogStackGuard =
  dialogManagementApi.registerMarkdownDialogStackGuard
