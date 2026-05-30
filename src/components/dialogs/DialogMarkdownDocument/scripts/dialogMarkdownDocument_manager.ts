import { i18n } from 'app/i18n/externalFileLoader'
import { registerMarkdownDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/appGlobalManagementUI_manager'
import { S_DialogMarkdown } from 'src/stores/S_Dialog'
import { computed, onMounted, ref, watch } from 'vue'

import { createDialogMarkdownDocument } from './functions/createDialogMarkdownDocument'
import {
  isNonEmptyMarkdownDocumentName,
  resolveDialogMarkdownDocumentAriaLabel
} from './functions/dialogMarkdownDocumentAriaLabel'
import { resolveDialogMarkdownStore as resolveDialogMarkdownStoreFn } from './functions/resolveDialogMarkdownStore'

const dialogMarkdownDocumentApi = createDialogMarkdownDocument({
  computed,
  isNonEmptyMarkdownDocumentName,
  onMounted,
  ref,
  registerMarkdownDialogStackGuard,
  resolveDialogMarkdownDocumentAriaLabel,
  resolveDialogMarkdownStore: () => resolveDialogMarkdownStoreFn(() => S_DialogMarkdown()),
  t: (key: string): string => i18n.global.t(key),
  watch
})

export const resolveDialogMarkdownStore = dialogMarkdownDocumentApi.resolveDialogMarkdownStore

export const useDialogMarkdownDocument = dialogMarkdownDocumentApi.useDialogMarkdownDocument
