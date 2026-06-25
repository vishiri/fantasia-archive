<template>
  <q-dialog
    v-model="dialogModel"
    :class="['dialogComponent', documentName, 'newProject']"
    :aria-label="$t('dialogs.newProject.ariaLabel')"
    @show="onDialogShow"
  >
    <q-card
      :class="['dialogComponent__wrapper', 'newProject', documentName]"
    >
      <q-card-section
        :class="['dialogComponent__content', documentName, 'newProject', 'hasScrollbar', 'q-pt-none']"
      >
        <h5
          id="dialogNewProject-title"
          class="text-center"
        >
          {{ $t('dialogs.newProject.title') }}
        </h5>

        <div class="dialogNewProject__nameInput q-mb-sm">
          <q-input
            ref="nameInputRef"
            v-model="projectName"
            color="primary-bright"
            counter
            dark
            data-test-locator="dialogNewProject-input-name"
            filled
            :label="$t('dialogs.newProject.nameLabel')"
            lazy-rules
            :maxlength="FA_PROJECT_NAME_MAX_LEN"
            outlined
            @keyup.enter="void onClickCreate()"
          />
        </div>
      </q-card-section>

      <q-card-actions
        align="around"
        class="q-card__actions q-mx-xl q-mt-lg q-mb-md q-card__actions--horiz row justify-around"
      >
        <q-btn
          v-close-popup
          flat
          color="accent"
          data-test-locator="dialogNewProject-button-close"
          :label="$t('dialogs.newProject.closeButton')"
        />
        <q-btn
          color="primary-bright"
          data-test-locator="dialogNewProject-button-create"
          :disable="createDisabled"
          :label="$t('dialogs.newProject.createButton')"
          outline
          type="button"
          @click="void onClickCreate()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

import {
  FA_PROJECT_NAME_MAX_LEN,
  useDialogNewProject
} from './scripts/dialogNewProject_manager'

defineOptions({
  name: 'DialogNewProject'
})

const props = defineProps<{
  directInput?: T_dialogName | undefined
}>()

const {
  createDisabled,
  dialogModel,
  documentName,
  nameInputRef,
  onClickCreate,
  onDialogShow,
  projectName
} = useDialogNewProject(props)
</script>

<style lang="scss">
.q-dialog.dialogComponent.newProject > .q-dialog__inner > .q-card.dialogComponent__wrapper {
  width: $dialogNewProject-wrapper-width;

  .dialogComponent__content {
    max-height: calc(100vh - #{$dialogNewProject-content-maxHeightSubtract});
    overflow: auto;
  }

  .dialogNewProject__nameInput {
    margin: 0 auto;
    max-width: $dialogNewProject-nameInput-maxWidth;
  }
}
</style>
