<template>
  <!-- Dialog wrapper: persistent blocks backdrop and Escape from closing; only actions dismiss. -->
  <q-dialog
    v-model="dialogModel"
    persistent
    :class="['dialogComponent', `${documentName}`]"
    aria-labelledby="dialogProgramSettings-title"
  >
    <q-card
      :class="['dialogComponent__wrapper', 'dialogProgramSettings', `${documentName}`]"
    >
      <!-- Title: fixed, does not scroll with tab content -->
      <q-card-section class="dialogProgramSettings__titleSection q-pt-lg q-px-lg q-pb-sm">
        <h4
          id="dialogProgramSettings-title"
          class="dialogProgramSettings__title text-center q-my-none"
        >
          {{ $t('dialogs.programSettings.title') }}
        </h4>
      </q-card-section>

      <!-- Body: vertical tabs + scrollable tab panels only -->
      <q-card-section class="dialogProgramSettings__body row no-wrap q-pa-none q-px-sm q-pb-none">
        <q-tabs
          v-model="selectedCategoryTab"
          vertical
          dense
          no-caps
          class="dialogProgramSettings__tabs q-pa-sm"
          active-color="primary-bright"
          indicator-color="primary-bright"
        >
          <q-tab
            v-for="(category, categoryKey) in programSettingsTree"
            :key="categoryKey"
            :name="categoryKey"
            :label="category.title"
            :data-test="`dialogProgramSettings-tab-${categoryKey}`"
          />
        </q-tabs>

        <q-separator vertical />

        <q-tab-panels
          v-model="selectedCategoryTab"
          animated
          vertical
          transition-prev="slide-down"
          transition-next="slide-up"
          class="dialogProgramSettings__tabPanelsRoot col q-pa-none"
        >
          <q-tab-panel
            v-for="(category, categoryKey) in programSettingsTree"
            :key="categoryKey"
            :name="categoryKey"
            class="dialogProgramSettings__tabPanel q-pa-none"
          >
            <q-scrollarea class="dialogProgramSettings__scrollArea">
              <div class="dialogProgramSettings__scrollInner q-px-md q-py-md q-pr-lg">
                <div
                  class="dialogProgramSettings__category"
                  :data-test="`dialogProgramSettings-category-${categoryKey}`"
                >
                  <div
                    v-for="(subCategory, subCategoryKey) in category.subCategories"
                    :key="subCategoryKey"
                    class="dialogProgramSettings__subCategory q-mb-md"
                    :data-test="`dialogProgramSettings-subcategory-${categoryKey}-${subCategoryKey}`"
                  >
                    <h6 class="dialogProgramSettings__subCategoryTitle text-subtitle2 q-mb-sm q-mt-none">
                      {{ subCategory.title }}
                    </h6>

                    <div
                      v-for="(setting, settingKey) in subCategory.settingsList"
                      :key="settingKey"
                      class="dialogProgramSettings__setting q-mb-sm"
                    >
                      <q-toggle
                        color="primary-bright"
                        :model-value="setting.value"
                        :label="setting.title"
                        @update:model-value="(value) => updateLocalSetting(settingKey, value)"
                      />
                      <p
                        v-if="setting.note !== undefined && setting.note !== ''"
                        class="dialogProgramSettings__settingNote text-caption q-ml-xl q-mt-xs q-mb-none"
                      >
                        {{ setting.note }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </q-scrollarea>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <!-- Card actions wrapper -->
      <q-card-actions
        align="right"
        class="q-mb-lg q-px-md q-gutter-sm"
      >
        <q-btn
          v-close-popup
          flat
          :label="$t('dialogs.programSettings.closeButton')"
          class="q-mr-xl"
          color="accent"
          data-test="dialogProgramSettings-button-close"
        />

        <q-btn
          outline
          :label="$t('dialogs.programSettings.saveButton')"
          color="primary-bright"
          data-test="dialogProgramSettings-button-save"
          @click="saveAndCloseDialog"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { T_dialogName } from 'app/types/T_dialogList'
import { S_DialogComponent } from 'src/stores/S_Dialog'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'
import { onMounted, ref, toRaw, watch } from 'vue'
import type { StoreGeneric } from 'pinia'
import type { I_faUserSettings } from 'app/types/I_faUserSettings'
import type { T_programSettingsRenderTree } from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.types'
import {
  syncLocalProgramSettingsFromStore,
  updateLocalProgramSetting
} from 'app/src/components/dialogs/DialogProgramSettings/scripts/programSettingsLocalSettingsManagement'

const resolveDialogComponentStore = (): StoreGeneric | null => {
  try {
    return S_DialogComponent()
  } catch {
    return null
  }
}

const resolveFaUserSettingsStore = (): ReturnType<typeof S_FaUserSettings> | null => {
  try {
    return S_FaUserSettings()
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

/**
 * Name of the document shown inside the dialog
 */
const documentName = ref('')

/**
 * Local editable snapshot of user settings.
 */
const localSettings = ref<I_faUserSettings | null>(null)
const programSettingsTree = ref<T_programSettingsRenderTree>({})
const selectedCategoryTab = ref<string>('')

watch(
  programSettingsTree,
  (tree) => {
    const keys = Object.keys(tree)
    if (keys.length === 0) {
      selectedCategoryTab.value = ''
      return
    }
    if (selectedCategoryTab.value === '' || !keys.includes(selectedCategoryTab.value)) {
      selectedCategoryTab.value = keys[0] as string
    }
  },
  {
    deep: true,
    immediate: true
  }
)

/**
 * Updates the local setting value
 */
const updateLocalSetting = (settingKey: string, updatedValue: boolean): void => {
  updateLocalProgramSetting(localSettings, programSettingsTree, settingKey, updatedValue)
}

/**
 * Syncs the local settings from the store
 */
const syncLocalSettingsFromStore = async (): Promise<void> => {
  await syncLocalProgramSettingsFromStore(resolveFaUserSettingsStore, localSettings, programSettingsTree)
}

/**
 * Opens the popup dialog via direct input-feed
 */
const openDialog = (input: T_dialogName) => {
  documentName.value = input
  dialogModel.value = true
  void syncLocalSettingsFromStore()
}

/**
 * Persists local settings snapshot and closes the dialog.
 */
const saveAndCloseDialog = async (): Promise<void> => {
  const faUserSettingsStore = resolveFaUserSettingsStore()
  if (faUserSettingsStore !== null && localSettings.value !== null) {
    const plainSettingsSnapshot: I_faUserSettings = { ...toRaw(localSettings.value) }
    await faUserSettingsStore.updateSettings(plainSettingsSnapshot)
  }

  dialogModel.value = false
}

/**
 * Trigger dialog popup via reaction to store update
 */
watch(() => resolveDialogComponentStore()?.dialogUUID, () => {
  const dialogComponentStore = resolveDialogComponentStore()
  if (dialogComponentStore?.dialogToOpen === 'ProgramSettings') {
    openDialog(dialogComponentStore.dialogToOpen as T_dialogName)
  }
})

/**
 * Trigger dialog popup via reaction to direct prop feed
 */
watch(() => props.directInput, () => {
  if (props.directInput !== undefined && props.directInput !== '') {
    if (props.directInput === 'ProgramSettings') {
      openDialog(props.directInput)
    }
  }
})

/**
 * Checks the prop feed-status on the first mount and open the dialog if the prop is properly fed in
 * This exists mostly due to component tests being flaky otherwise
 */
onMounted(() => {
  if (props.directInput === 'ProgramSettings') {
    openDialog(props.directInput)
  }
})

</script>

<style lang="scss">
.ProgramSettings {
  &.dialogComponent__wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: calc(100vh - 48px);
    max-width: calc(100vw - 100px);
    overflow: hidden;
    width: 1400px;
  }

  .dialogProgramSettings__titleSection {
    flex-shrink: 0;
  }

  .dialogProgramSettings__body {
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
  }

  .dialogProgramSettings__tabs {
    align-self: stretch;
    flex: 0 0 auto;

    .q-tab__label {
      font-size: 0.7rem;
      letter-spacing: 0.06em;
      text-align: left;
      text-transform: uppercase;
      white-space: normal;
    }

    .q-tab {
      justify-content: flex-start;
      min-height: 2.75rem;
      padding-left: 0.5rem;
      padding-right: 1rem;
    }
  }

  .dialogProgramSettings__tabPanelsRoot {
    background: transparent;
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
  }

  .dialogProgramSettings__tabPanel {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    max-height: 100%;
    min-height: 0;
    overflow: hidden;
    padding: 0;
  }

  .dialogProgramSettings__scrollArea {
    flex: 1 1 auto;
    height: 100%;
    min-height: 0;
  }

  .dialogProgramSettings__scrollInner {
    min-height: 120px;
  }
}
</style>
