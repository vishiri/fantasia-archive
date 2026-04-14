<template>
  <!-- Dialog wrapper -->
  <q-dialog
    v-model="dialogModel"
    :class="['dialogComponent', `${documentName}`]"
    aria-labelledby="dialogAboutFantasiaArchive-title"
  >
    <q-card
      :class="['dialogComponent__wrapper', `${documentName}`]"
    >
      <!-- Dialog contents wrapper -->
      <q-card-section :class="['dialogComponent__content', `${documentName}`, 'q-mt-xl', 'q-mb-lg', 'q-mr-lg', 'q-ml-xl', 'q-pt-none']">
        <h6 id="dialogAboutFantasiaArchive-title">
          {{ $t('dialogs.aboutFantasiaArchive.title') }}
        </h6>

        <div>
          {{ $t('dialogs.aboutFantasiaArchive.versionTitle') }} <span class="text-bold text-primary-bright">{{ appVersion }}</span>
        </div>

        <q-separator
          color="primary"
          horizontal
          dark
          class="q-my-lg q-mx-auto"
          style="width: 400px;"
        />

        <SocialContactButtons />
      </q-card-section>

      <!-- Card actions wrapper -->
      <q-card-actions
        align="around"
        class="q-mb-lg"
      >
        <!-- Close button -->
        <q-btn
          v-close-popup
          flat
          :label="$t('dialogs.aboutFantasiaArchive.closeButton')"
          color="accent"
          data-test-locator="dialogComponent-button-close"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { registerDialogComponentOpenLease } from 'app/src/scripts/appInfo/registerDialogComponentOpenLease'
import { S_DialogComponent } from 'src/stores/S_Dialog'
import { onMounted, ref, watch } from 'vue'
import SocialContactButtons from '../../other/SocialContactButtons/SocialContactButtons.vue'
import type { StoreGeneric } from 'pinia'

const resolveDialogComponentStore = (): StoreGeneric | null => {
  try {
    return S_DialogComponent()
  } catch {
    return null
  }
}

/**
 * All component props
 */
const props = defineProps<{
  /**
   * Custom input directly fed to the component in case it doesn't get triggered from the global store
   */
  directInput?: T_dialogName
}>()

/**
 * Model for the current popup dialog
 */
const dialogModel = ref(false)

registerDialogComponentOpenLease(dialogModel)

/**
 * Name of the document shown inside the dialog
 */
const documentName = ref('')

/**
  * Current app version
  * NOTE: This shows Electron version in DEV mode instead of NPM package version. This is a well known issue with Electron.
  */
const appVersion = ref('')

/**
 * Opens the popup dialog via direct input-feed
 */
const openDialog = async (input: T_dialogName) => {
  documentName.value = input
  dialogModel.value = true
  const v = await window.faContentBridgeAPIs?.appDetails?.getProjectVersion?.() ?? ''
  appVersion.value = v
}

/**
 * Trigger dialog popup via reaction to store update
 */
watch(() => resolveDialogComponentStore()?.dialogUUID, () => {
  const dialogComponentStore = resolveDialogComponentStore()
  if (dialogComponentStore?.dialogToOpen === 'AboutFantasiaArchive') {
    openDialog(dialogComponentStore.dialogToOpen as T_dialogName)
  }
})

/**
 * Trigger dialog popup via reaction to direct prop feed
 */
watch(() => props.directInput, () => {
  if (props.directInput !== undefined && props.directInput !== '') {
    if (props.directInput === 'AboutFantasiaArchive') {
      openDialog(props.directInput)
    }
  }
})

/**
 * Checks the prop feed-status on the first mount and open the dialog if the prop is properly fed in
 * This exists mostly due to component tests being flaky otherwise
 */
onMounted(() => {
  if (props.directInput !== undefined && props.directInput !== '') {
    openDialog(props.directInput)
  }
})

</script>

<style lang="scss">
.AboutFantasiaArchive {
  .dialogComponent__wrapper {
    max-width: $dialogAboutFantasiaArchive-wrapper-maxWidth;
    width: $dialogAboutFantasiaArchive-wrapper-width;
  }

  .dialogComponent__content {
    max-height: calc(100vh - #{$dialogAboutFantasiaArchive-content-maxHeightSubtract});
    overflow: auto;
    text-align: center;
  }
}

</style>
