<template>
  <q-dialog
    v-model="dialogModel"
    persistent
    :class="['dialogComponent', documentName, 'newProjectSettings']"
    :aria-label="$t('dialogs.newProjectSettings.ariaLabel')"
  >
    <q-card
      :class="['dialogComponent__wrapper', 'newProjectSettings', documentName]"
    >
      <q-card-section
        :class="['dialogComponent__content', documentName, 'newProjectSettings', 'hasScrollbar', 'q-pt-none']"
      >
        <h5
          id="dialogNewProjectSettings-title"
          class="q-mb-md text-center"
        >
          {{ $t('dialogs.newProjectSettings.title') }}
        </h5>

        <q-input
          v-model="projectName"
          class="q-mb-sm"
          color="dark"
          dark
          data-test-locator="dialogNewProjectSettings-input-name"
          filled
          :label="$t('dialogs.newProjectSettings.nameLabel')"
          lazy-rules
          outlined
          @keyup.enter="void onClickCreate()"
        />

        <p class="text-caption fa-text-muted q-mb-none">
          {{ $t('dialogs.newProjectSettings.nameHint') }}
        </p>
      </q-card-section>

      <q-card-actions align="around">
        <q-btn
          v-close-popup
          flat
          color="accent"
          data-test-locator="dialogNewProjectSettings-button-close"
          :label="$t('dialogs.newProjectSettings.closeButton')"
        />
        <q-btn
          color="primary-bright"
          data-test-locator="dialogNewProjectSettings-button-create"
          :disable="createDisabled"
          :label="$t('dialogs.newProjectSettings.createButton')"
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

import { computed, onMounted, ref, watch } from 'vue'

import { registerComponentDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/dialogManagement'
import { S_DialogComponent } from 'app/src/stores/S_Dialog'

import { runDialogNewProjectSettingsCreate } from './scripts/dialogNewProjectSettingsSubmit'

defineOptions({
  name: 'DialogNewProjectSettings'
})

const resolveDialogComponentStore = (): StoreGeneric | null => {
  try {
    return S_DialogComponent()
  } catch {
    return null
  }
}

const props = defineProps<{
  directInput?: T_dialogName
}>()

const dialogModel = ref(false)
const projectName = ref('')

registerComponentDialogStackGuard(dialogModel)

const documentName = ref('')

const createDisabled = computed(() => {
  return projectName.value.trim().length === 0
})

function openDialog (input: T_dialogName): void {
  documentName.value = input
  dialogModel.value = true
}

function closeDialog (): void {
  dialogModel.value = false
  projectName.value = ''
}

async function onClickCreate (): Promise<void> {
  if (createDisabled.value) {
    return
  }
  await runDialogNewProjectSettingsCreate(projectName.value.trim(), closeDialog)
}

watch(() => resolveDialogComponentStore()?.dialogUUID, () => {
  const dialogComponentStore = resolveDialogComponentStore()
  if (dialogComponentStore?.dialogToOpen === 'NewProjectSettings') {
    openDialog(dialogComponentStore.dialogToOpen as T_dialogName)
  }
})

watch(() => props.directInput, () => {
  if (props.directInput === 'NewProjectSettings') {
    openDialog(props.directInput)
  }
})

onMounted(() => {
  if (props.directInput === 'NewProjectSettings') {
    openDialog(props.directInput)
  }
})
</script>

<style lang="scss">
.newProjectSettings {
  .dialogComponent__wrapper {
    max-width: $dialogNewProjectSettings-wrapper-maxWidth;
    width: $dialogNewProjectSettings-wrapper-width;
  }

  .dialogComponent__content {
    max-height: calc(100vh - #{$dialogNewProjectSettings-content-maxHeightSubtract});
    overflow: auto;
  }
}
</style>
