<template>
  <!-- Dialog wrapper -->
  <q-dialog
    v-model="dialogModel"
    :class="['dialogComponent', `${documentName}`]"
  >
    <q-card>
      <!-- Dialog contents wrapper -->
      <q-card-section :class="['dialogComponent__content', `${documentName}`, 'q-mt-xl', 'q-mb-lg', 'q-mr-lg', 'q-ml-xl', 'q-pt-none']">
        <h6>
          {{ $t('Dialogs.aboutFantasiaArchive.title') }}
        </h6>

        <div>
          {{ $t('Dialogs.aboutFantasiaArchive.versionTitle') }} <span class="text-bold text-primary-bright">{{ appVersion }}</span>
        </div>

        <q-separator
          color="primary"
          horizonatal
          dark
          class="q-my-lg q-mx-auto"
          style="opacity: 0.5; width: 400px;"
        />
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
          label="Close"
          color="accent"
          data-test="dialogComponent-button-close"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { T_dialogList } from 'app/types/T_dialogList'
import { S_DialogComponent } from 'src/stores/S_Dialog'
import { onMounted, ref, watch } from 'vue'

/**
 * All component props
 */
const props = defineProps<{
  /**
   * Custom input directly fed to the component in case it doesn't get triggered from the global store
   */
  directInput?: T_dialogList
}>()

/**
 * Model for the current popup dialog
 */
const dialogModel = ref(false)

/**
 * Name of the document shown inside the dialog
 */
const documentName = ref('')

/**
   * Current app version
   * NOTE: Show Electon version in DEV mode instead of NPM package version
   */
let appVersion = ''

/**
 * Opens the popup dialog via direct input-feed
 */
const openDialog = (input: T_dialogList) => {
  documentName.value = input
  dialogModel.value = true
  appVersion = window.appDetails.PROJECT_VERSION
}

/**
 * Trigger dialog popup via reaction to store update
 */
watch(() => S_DialogComponent.dialogUUID, () => {
  if (S_DialogComponent.dialogToOpen === 'AboutFantasiaArchive') {
    openDialog(S_DialogComponent.dialogToOpen)
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
 * This exist mostly due to component tests being flaky otherwise
 */
onMounted(() => {
  if (props.directInput !== undefined && props.directInput !== '') {
    openDialog(props.directInput)
  }
})

</script>

<style lang="scss">

.AboutFantasiaArchive {
  .dialogComponent__content {
    text-align: center;
    overflow: auto;
    max-height: calc(100vh - 235px);
  }
}

</style>
