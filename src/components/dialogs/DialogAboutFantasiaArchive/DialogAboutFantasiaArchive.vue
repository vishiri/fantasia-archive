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
      <q-card-section :class="['dialogComponent__content', `${documentName}`, 'q-mt-xl', 'q-mb-lg', 'q-mr-lg', 'q-ml-xl', 'q-pt-none', 'hasScrollbar']">
        <h5
          id="dialogAboutFantasiaArchive-title"
          class="text-h5"
        >
          {{ $t('dialogs.aboutFantasiaArchive.title') }}
        </h5>

        <div>
          {{ $t('dialogs.aboutFantasiaArchive.versionTitle') }} <span class="text-bold text-primary-bright">{{ appVersion }}</span>
        </div>

        <q-separator
          color="primary"
          horizontal
          dark
          class="dialogAboutFantasiaArchive__titleSeparator q-my-lg q-mx-auto"
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

import SocialContactButtons from '../../other/SocialContactButtons/SocialContactButtons.vue'
import { useDialogAboutFantasiaArchive } from './scripts/dialogAboutFantasiaArchive_manager'

const props = defineProps<{
  /**
   * Custom input directly fed to the component in case it doesn't get triggered from the global store
   */
  directInput?: T_dialogName | undefined
}>()

const {
  appVersion,
  dialogModel,
  documentName
} = useDialogAboutFantasiaArchive(props)
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

  .dialogAboutFantasiaArchive__titleSeparator {
    max-width: 100%;
    width: $dialogAboutFantasiaArchive-titleSeparator-width;
  }
}

</style>
