import { registerComponentDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/appGlobalManagementUI_manager'
import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun_manager'
import { S_DialogComponent } from 'src/stores/S_Dialog'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Result } from 'neverthrow'
import { i18n } from 'app/i18n/externalFileLoader'

import { loadFaProjectMediaListFromBridge } from 'app/src/scripts/faProjectMedia/faProjectMediaHasAnyWiring'
import { decodeFaProjectMediaUrlSegmentOrRaw } from 'app/src/scripts/faProjectMedia/faProjectMediaDisplayNameDecodeWiring'
import {
  createFaProjectMediaMassEditRowsFromOnlineUrlsDraft,
  hasFaProjectMediaOnlineUrlDraftContent,
  isFaProjectMediaMassEditRowDirty,
  mapFaProjectMediaMassEditRowToUpsertItem,
  mapFaProjectMediaMassEditRowsToUpsertItems,
  mapFaProjectMediaToMassEditRow,
  normalizeFaProjectMediaPanel,
  resolveFaProjectMediaDialogPersistent,
  resolveFaProjectMediaDialogTitleI18nKey
} from 'app/src/scripts/faProjectMedia/faProjectMedia_manager'
import {
  isDialogProjectMediaDirectInput,
  isDialogProjectMediaStoreTarget
} from './functions/dialogProjectMediaDialogInput'
import {
  applyDialogProjectMediaListLoad,
  attachDialogProjectMediaWatches,
  submitOnlineUrlsIntake
} from './functions/dialogProjectMediaSession'
import { bindUseDialogProjectMedia } from './bindDialogProjectMediaUse'
import { bindDialogProjectMediaMassEditSave } from './dialogProjectMediaMassEditSave'
import { bindDialogProjectMediaSingleEditSave } from './dialogProjectMediaSingleEditSave'
import { createDialogProjectMedia } from './functions/createDialogProjectMedia'
import {
  bindDialogProjectMediaSingleEdit,
  FA_DIALOG_PROJECT_MEDIA_SINGLE_EDIT_SLIDE_MS
} from './functions/dialogProjectMediaSingleEdit'
import { createResolveDialogComponentStore } from './functions/createResolveDialogComponentStore'

const resolveDialogComponentStoreBinding = createResolveDialogComponentStore({
  fromThrowable: Result.fromThrowable,
  getDialogComponentStore: () => S_DialogComponent()
})

const dialogProjectMediaApi = createDialogProjectMedia({
  applyListLoad: applyDialogProjectMediaListLoad,
  attachWatches: attachDialogProjectMediaWatches,
  attachWindowKeydown: (handler) => {
    window.addEventListener('keydown', handler, true)
  },
  bindMassEditSave: bindDialogProjectMediaMassEditSave,
  bindSingleEdit: bindDialogProjectMediaSingleEdit,
  bindSingleEditSave: bindDialogProjectMediaSingleEditSave,
  bindUse: bindUseDialogProjectMedia,
  computed,
  createMassEditRowsFromOnlineUrlsDraft: (draft) => createFaProjectMediaMassEditRowsFromOnlineUrlsDraft({
    createId: () => crypto.randomUUID(),
    decodeSegment: decodeFaProjectMediaUrlSegmentOrRaw,
    draft
  }),
  detachWindowKeydown: (handler) => {
    window.removeEventListener('keydown', handler, true)
  },
  getRequestedPanel: () => {
    const store = resolveDialogComponentStoreBinding.resolveDialogComponentStore()
    return normalizeFaProjectMediaPanel(store?.projectMediaRequestedPanel)
  },
  hasFaProjectMediaOnlineUrlDraftContent,
  isDialogProjectMediaDirectInput,
  isDialogProjectMediaStoreTarget,
  isMassEditRowDirty: isFaProjectMediaMassEditRowDirty,
  loadListMedia: loadFaProjectMediaListFromBridge,
  mapMediaToMassEditRow: mapFaProjectMediaToMassEditRow,
  mapRowToUpsertItem: (row) => mapFaProjectMediaMassEditRowToUpsertItem(
    row,
    i18n.global.t('dialogs.projectMedia.untitledDisplayName')
  ),
  mapRowsToUpsertItems: (rows) => mapFaProjectMediaMassEditRowsToUpsertItems(
    rows,
    i18n.global.t('dialogs.projectMedia.untitledDisplayName')
  ),
  normalizeFaProjectMediaPanel,
  onBeforeUnmount,
  onMounted,
  ref,
  registerComponentDialogStackGuard,
  resolveDialogComponentStore: resolveDialogComponentStoreBinding.resolveDialogComponentStore,
  resolveFaProjectMediaDialogPersistent,
  resolveFaProjectMediaDialogTitleI18nKey,
  runFaActionAwait,
  submitOnlineUrlsIntake,
  watch
})

export const resolveDialogComponentStore = dialogProjectMediaApi.resolveDialogComponentStore

export const useDialogProjectMedia = dialogProjectMediaApi.useDialogProjectMedia

export { FA_DIALOG_PROJECT_MEDIA_SINGLE_EDIT_SLIDE_MS }
export {
  applyDialogProjectMediaSingleEditSlideArrowKeydown,
  createDialogProjectMediaSingleEditSlideNavActions
} from './functions/dialogProjectMediaSingleEditSlideArrowNav'
export {
  resolveDialogProjectMediaSingleEditNavPanes,
  resolveDialogProjectMediaSingleEditNavTrackClassList,
  shouldFinishDialogProjectMediaSingleEditNavTrackTransition,
  shouldIgnoreFaProjectMediaSingleEditLiveRowUpdate
} from './functions/dialogProjectMediaSingleEditNavTrack'
