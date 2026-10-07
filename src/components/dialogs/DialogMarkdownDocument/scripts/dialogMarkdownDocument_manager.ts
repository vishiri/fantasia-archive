import { i18n } from 'app/i18n/externalFileLoader'
import { registerMarkdownDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/appGlobalManagementUI_manager'
import { S_DialogMarkdown } from 'src/stores/S_Dialog'
import { computed, onMounted, ref, watch } from 'vue'
import { Result } from 'neverthrow'

import { createDialogMarkdownDocument } from './functions/createDialogMarkdownDocument'
import {
  isNonEmptyMarkdownDocumentName,
  resolveDialogMarkdownDocumentAriaLabel
} from './functions/dialogMarkdownDocumentAriaLabel'

const dialogMarkdownDocumentApi = createDialogMarkdownDocument({
  computed,
  isNonEmptyMarkdownDocumentName,
  onMounted,
  ref,
  registerMarkdownDialogStackGuard,
  resolveDialogMarkdownDocumentAriaLabel,
  resolveDialogMarkdownStore: () => Result.fromThrowable(
    () => S_DialogMarkdown(),
    () => null
  )().unwrapOr(null),
  t: (key: string): string => i18n.global.t(key),
  watch
})

export const resolveDialogMarkdownStore = dialogMarkdownDocumentApi.resolveDialogMarkdownStore

export const useDialogMarkdownDocument = dialogMarkdownDocumentApi.useDialogMarkdownDocument
