import { FA_PROJECT_NAME_MAX_LEN as faProjectNameMaxLen } from 'app/src-electron/shared/faProjectConstants'
import { registerComponentDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/appGlobalManagementUI_manager'
import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun_manager'
import { S_DialogComponent } from 'src/stores/S_Dialog'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { Result } from 'neverthrow'

import { createResolveDialogComponentStore } from 'app/src/components/dialogs/DialogAboutFantasiaArchive/scripts/functions/createResolveDialogComponentStore'
import { createDialogNewProject } from './functions/createDialogNewProject'
import { isDialogNewProjectCreateDisabled } from './functions/dialogNewProjectCreateDisabled'
import {
  isDialogNewProjectDirectInput,
  isDialogNewProjectStoreTarget
} from './functions/dialogNewProjectDialogInput'

const resolveDialogComponentStoreOrNullBinding = createResolveDialogComponentStore({
  fromThrowable: Result.fromThrowable,
  getDialogComponentStore: () => S_DialogComponent()
}).resolveDialogComponentStore

const dialogNewProjectApi = createDialogNewProject({
  FA_PROJECT_NAME_MAX_LEN: faProjectNameMaxLen,
  computed,
  isDialogNewProjectCreateDisabled,
  isDialogNewProjectDirectInput,
  isDialogNewProjectStoreTarget,
  nextTick,
  onMounted,
  ref,
  registerComponentDialogStackGuard,
  resolveDialogComponentStoreOrNull: resolveDialogComponentStoreOrNullBinding,
  runFaActionAwait,
  watch
})

export const FA_PROJECT_NAME_MAX_LEN = faProjectNameMaxLen

export const resolveDialogComponentStoreOrNull =
  dialogNewProjectApi.resolveDialogComponentStoreOrNull

export const runDialogNewProjectCreate = dialogNewProjectApi.runDialogNewProjectCreate

export const useDialogNewProject = dialogNewProjectApi.useDialogNewProject
