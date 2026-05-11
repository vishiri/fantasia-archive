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
import type { StoreGeneric } from 'pinia'
import { Result } from 'neverthrow'

import { computed, nextTick, onMounted, ref, watch } from 'vue'

import { FA_PROJECT_NAME_MAX_LEN } from 'app/src-electron/shared/faProjectConstants'
import { registerComponentDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/dialogManagement'
import { S_DialogComponent } from 'app/src/stores/S_Dialog'

import { runDialogNewProjectCreate } from './scripts/dialogNewProjectSubmit'

defineOptions({
  name: 'DialogNewProject'
})

const resolveDialogComponentStore = (): StoreGeneric | null => {
  return Result.fromThrowable(
    (): StoreGeneric => S_DialogComponent(),
    (): null => null
  )().unwrapOr(null)
}

const props = defineProps<{
  directInput?: T_dialogName
}>()

const dialogModel = ref(false)
const projectName = ref('')
const nameInputRef = ref<{ focus: () => void } | null>(null)

registerComponentDialogStackGuard(dialogModel)

const documentName = ref('')

async function focusNameInputAfterShow (): Promise<void> {
  await nextTick()
  nameInputRef.value?.focus()
}

function onDialogShow (): void {
  void focusNameInputAfterShow()
}

watch(dialogModel, (isOpen) => {
  if (isOpen) {
    projectName.value = ''
  }
})

const createDisabled = computed(() => {
  return projectName.value.trim().length === 0
})

function openDialog (input: T_dialogName): void {
  documentName.value = input
  dialogModel.value = true
}

function closeDialog (): void {
  dialogModel.value = false
}

async function onClickCreate (): Promise<void> {
  if (createDisabled.value) {
    return
  }
  await runDialogNewProjectCreate(projectName.value.trim(), closeDialog)
}

watch(() => resolveDialogComponentStore()?.dialogUUID, () => {
  const dialogComponentStore = resolveDialogComponentStore()
  if (dialogComponentStore?.dialogToOpen === 'NewProject') {
    openDialog(dialogComponentStore.dialogToOpen as T_dialogName)
  }
})

watch(() => props.directInput, () => {
  if (props.directInput === 'NewProject') {
    openDialog(props.directInput)
  }
})

onMounted(() => {
  if (props.directInput === 'NewProject') {
    openDialog(props.directInput)
  }
})
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
