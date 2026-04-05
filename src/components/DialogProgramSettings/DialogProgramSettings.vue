<template>
  <!-- Dialog wrapper: persistent blocks backdrop and Escape from closing; only actions dismiss. -->
  <q-dialog
    v-model="dialogModel"
    persistent
    :class="['dialogComponent', `${documentName}`]"
    aria-labelledby="dialogProgramSettings-title"
  >
    <q-card
      :class="['dialogComponent__wrapper', `${documentName}`]"
    >
      <!-- Dialog contents wrapper -->
      <q-card-section :class="['dialogComponent__content', `${documentName}`, 'q-mt-xl', 'q-mb-lg', 'q-mr-lg', 'q-ml-xl', 'q-pt-none']">
        <h4
          id="dialogProgramSettings-title"
          class="text-center"
        >
          {{ $t('dialogs.programSettings.title') }}
        </h4>

        <div
          v-for="(category, categoryKey) in programSettingsTree"
          :key="categoryKey"
          class="dialogComponent__category q-mt-lg"
          :data-test="`dialogProgramSettings-category-${categoryKey}`"
        >
          <h5 class="dialogComponent__categoryTitle q-mb-sm">
            {{ category.title }}
          </h5>

          <div
            v-for="(subCategory, subCategoryKey) in category.subCategories"
            :key="subCategoryKey"
            class="dialogComponent__subCategory q-mb-md"
            :data-test="`dialogProgramSettings-subcategory-${categoryKey}-${subCategoryKey}`"
          >
            <h6 class="dialogComponent__subCategoryTitle q-mb-xs">
              {{ subCategory.title }}
            </h6>

            <div
              v-for="(setting, settingKey) in subCategory.settingsList"
              :key="settingKey"
              class="dialogComponent__setting q-mb-sm"
            >
              <q-toggle
                color="primary-bright"
                :model-value="setting.value"
                :label="setting.title"
                @update:model-value="(value) => updateLocalSetting(settingKey, value)"
              />
              <p
                v-if="setting.note !== undefined && setting.note !== ''"
                class="dialogComponent__settingNote text-caption q-ml-xl q-mt-xs q-mb-none"
              >
                {{ setting.note }}
              </p>
            </div>
          </div>
        </div>
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
import { i18n } from 'app/src/i18n/externalFileLoader'
import { PROGRAM_SETTINGS_OPTIONS } from 'app/src/components/DialogProgramSettings/_data/programSettingsOptions'
import type { I_programSubCategoryRenderItem, T_programSettingsRenderTree } from 'app/src/components/DialogProgramSettings/DialogProgramSettings.types'
const DEVELOPER_SETTINGS_CATEGORY_KEY = 'developerSettings'

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

function toSortedRecord<T> (record: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(record).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)))
}

const getTranslation = (translationPath: string): string => {
  const translatedValue = i18n.global.t(translationPath)
  return typeof translatedValue === 'string' ? translatedValue : translationPath
}

const hasTranslation = (translationPath: string): boolean => {
  return i18n.global.te(translationPath) || i18n.global.te(translationPath, 'en-US')
}

const buildProgramSettingsRenderTree = (settingsSnapshot: I_faUserSettings): T_programSettingsRenderTree => {
  const unsortedTree: T_programSettingsRenderTree = {}
  const settingKeys = Object.keys(settingsSnapshot).sort((keyA, keyB) => keyA.localeCompare(keyB))

  for (const settingKey of settingKeys) {
    const normalizedSettingKey = settingKey as keyof I_faUserSettings
    const settingOption = PROGRAM_SETTINGS_OPTIONS[normalizedSettingKey]
    const categoryKey = settingOption.category
    const subCategoryKey = settingOption.subcategory

    if (unsortedTree[categoryKey] === undefined) {
      unsortedTree[categoryKey] = {
        title: getTranslation(`dialogs.programSettings.appOptionsCategories.${categoryKey}.title`),
        subCategories: {}
      }
    }

    if (unsortedTree[categoryKey].subCategories[subCategoryKey] === undefined) {
      unsortedTree[categoryKey].subCategories[subCategoryKey] = {
        title: getTranslation(`dialogs.programSettings.appOptionsCategories.${categoryKey}.${subCategoryKey}.subtitle`),
        settingsList: {}
      }
    }

    const noteTranslationPath = `dialogs.programSettings.appOptions.${settingKey}.note`
    const noteValue = hasTranslation(noteTranslationPath) ? getTranslation(noteTranslationPath) : undefined

    unsortedTree[categoryKey].subCategories[subCategoryKey].settingsList[settingKey] = {
      title: getTranslation(`dialogs.programSettings.appOptions.${settingKey}.title`),
      value: settingsSnapshot[normalizedSettingKey],
      tags: getTranslation(`dialogs.programSettings.appOptions.${settingKey}.tags`),
      ...(noteValue !== undefined ? { note: noteValue } : {})
    }
  }

  const sortedCategoryEntries = Object.entries(unsortedTree).sort(([categoryA], [categoryB]) => {
    if (categoryA === DEVELOPER_SETTINGS_CATEGORY_KEY && categoryB !== DEVELOPER_SETTINGS_CATEGORY_KEY) {
      return 1
    }
    if (categoryB === DEVELOPER_SETTINGS_CATEGORY_KEY && categoryA !== DEVELOPER_SETTINGS_CATEGORY_KEY) {
      return -1
    }
    return categoryA.localeCompare(categoryB)
  })
  const sortedTree: T_programSettingsRenderTree = {}

  for (const [categoryKey, categoryValue] of sortedCategoryEntries) {
    const sortedSubCategories = toSortedRecord(categoryValue.subCategories)
    const sortedCategorySubTrees: Record<string, I_programSubCategoryRenderItem> = {}

    for (const [subCategoryKey, subCategoryValue] of Object.entries(sortedSubCategories)) {
      sortedCategorySubTrees[subCategoryKey] = {
        ...subCategoryValue,
        settingsList: toSortedRecord(subCategoryValue.settingsList)
      }
    }

    sortedTree[categoryKey] = {
      ...categoryValue,
      subCategories: sortedCategorySubTrees
    }
  }

  return sortedTree
}

const updateLocalSetting = (settingKey: string, updatedValue: boolean): void => {
  if (localSettings.value === null) {
    return
  }

  const normalizedSettingKey = settingKey as keyof I_faUserSettings
  localSettings.value[normalizedSettingKey] = updatedValue

  const settingMetadata = PROGRAM_SETTINGS_OPTIONS[normalizedSettingKey]
  const categoryEntry = programSettingsTree.value[settingMetadata.category]
  if (categoryEntry === undefined) {
    return
  }

  const subCategoryEntry = categoryEntry.subCategories[settingMetadata.subcategory]
  if (subCategoryEntry === undefined || subCategoryEntry.settingsList[settingKey] === undefined) {
    return
  }

  subCategoryEntry.settingsList[settingKey].value = updatedValue
}

/**
 * Pulls the latest settings from the store into the local editable copy.
 */
const syncLocalSettingsFromStore = async (): Promise<void> => {
  const faUserSettingsStore = resolveFaUserSettingsStore()
  if (faUserSettingsStore === null) {
    return
  }

  if (faUserSettingsStore.settings === null) {
    await faUserSettingsStore.refreshSettings()
  }

  if (faUserSettingsStore.settings !== null) {
    localSettings.value = { ...faUserSettingsStore.settings }
    programSettingsTree.value = buildProgramSettingsRenderTree(localSettings.value)
  }
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
  .dialogComponent__wrapper {
    width: 100%;
    max-width: 80vw;
  }

  .dialogComponent__content {
    min-height: 120px;
  }
}
</style>
