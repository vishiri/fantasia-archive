import { registerComponentDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/appGlobalManagementUI_manager'
import { S_DialogComponent } from 'src/stores/S_Dialog'
import { onMounted, ref, watch } from 'vue'
import { Result } from 'neverthrow'

import {
  isDialogAboutFantasiaArchiveDirectInput,
  isDialogAboutFantasiaArchiveStoreTarget
} from './functions/dialogAboutFantasiaArchiveDialogInput'
import { createDialogAboutFantasiaArchive } from './functions/createDialogAboutFantasiaArchive'
import { createResolveDialogComponentStore } from './functions/createResolveDialogComponentStore'

const resolveDialogComponentStoreBinding = createResolveDialogComponentStore({
  fromThrowable: Result.fromThrowable,
  getDialogComponentStore: () => S_DialogComponent()
})

const dialogAboutFantasiaArchiveApi = createDialogAboutFantasiaArchive({
  isDialogAboutFantasiaArchiveDirectInput,
  isDialogAboutFantasiaArchiveStoreTarget,
  onMounted,
  ref,
  registerComponentDialogStackGuard,
  resolveDialogComponentStore: resolveDialogComponentStoreBinding.resolveDialogComponentStore,
  watch
})

export const resolveDialogComponentStore = dialogAboutFantasiaArchiveApi.resolveDialogComponentStore

export const useDialogAboutFantasiaArchive = dialogAboutFantasiaArchiveApi.useDialogAboutFantasiaArchive
