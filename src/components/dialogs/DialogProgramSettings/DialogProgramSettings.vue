<template>
  <!-- Dialog wrapper: persistent blocks backdrop and Escape from closing; only actions dismiss. -->
  <q-dialog
    v-model="dialogModel"
    persistent
    :class="[
      'dialogComponent',
      `${documentName}`,
      hasActiveSearchQuery ? 'hasActiveSearchQuery' : ''
    ]"
    aria-labelledby="dialogProgramSettings-title"
  >
    <q-card
      :class="['dialogComponent__wrapper', 'dialogProgramSettings', `${documentName}`]"
    >
      <!-- Title: fixed, does not scroll with tab content -->
      <h4
        id="dialogProgramSettings-title"
        class="dialogProgramSettings__title text-center"
        data-test-locator="dialogProgramSettings-title"
      >
        {{ $t('dialogs.programSettings.title') }}
      </h4>

      <Transition
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
        :duration="200"
      >
        <div
          v-if="hasActiveSearchQuery"
          class="dialogProgramSettings__tabsSearchOverlay"
          data-test-locator="dialogProgramSettings-tabsSearchOverlay"
        />
      </Transition>

      <!-- Body: vertical tabs + scrollable tab panels only -->
      <q-card-section class="dialogProgramSettings__body row no-wrap q-pa-none">
        <div class="dialogProgramSettings__settingsSearchWrapper">
          <q-input
            v-model="searchSettingsQuery"
            :placeholder="$t('dialogs.programSettings.settingsSearchPlaceholder')"
            clearable
            dense
            dark
            debounce="300"
            class="dialogProgramSettings__settingsSearchInput"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <q-tabs
          v-model="selectedCategoryTab"
          vertical
          :class="{
            'dialogProgramSettings__tabs': true,
            'dialogProgramSettings__tabs--nonInteractive': hasActiveSearchQuery
          }"
          active-color="primary-bright"
          indicator-color="primary-bright"
        >
          <q-tab
            v-for="(category, categoryKey) in programSettingsTree"
            :key="categoryKey"
            class="text-grey-5"
            :name="categoryKey"
            :label="category.title"
            :data-test-locator="`dialogProgramSettings-tab-${categoryKey}`"
          />
        </q-tabs>

        <q-separator vertical />

        <div class="dialogProgramSettings__tabPanelsHost col q-pa-none">
          <q-tab-panels
            v-model="selectedCategoryTab"
            animated
            vertical
            transition-prev="jump-up"
            transition-next="jump-down"
            class="dialogProgramSettings__tabPanelsRoot q-pa-none"
          >
            <q-tab-panel
              v-for="(category, categoryKey) in programSettingsTree"
              :key="categoryKey"
              :name="categoryKey"
              class="dialogProgramSettings__tabPanel q-pa-none"
            >
              <div class="dialogProgramSettings__panelScroll hasScrollbar">
                <div class="dialogProgramSettings__panelScrollInner q-py-sm">
                  <div
                    class="dialogProgramSettings__category"
                    :data-test-locator="`dialogProgramSettings-category-${categoryKey}`"
                  >
                    <h5
                      class="dialogProgramSettings__categoryTitle text-bold q-my-none text-h6"
                      data-test-locator="dialogProgramSettings-categoryTitle"
                    >
                      {{ category.title }}
                    </h5>

                    <div
                      v-for="(subCategory, subCategoryKey, subCategoryIndex) in category.subCategories"
                      :key="subCategoryKey"
                      class="dialogProgramSettings__subCategory"
                      :data-test-locator="`dialogProgramSettings-subcategory-${categoryKey}-${subCategoryKey}`"
                    >
                      <h6
                        class="dialogProgramSettings__subCategoryTitle text-bold q-mb-none text-subtitle1 text-primary-bright"
                        data-test-locator="dialogProgramSettings-subcategoryTitle"
                      >
                        {{ subCategory.title }}
                      </h6>

                      <div class="row q-col-gutter-md">
                        <div
                          v-for="(setting, settingKey) in subCategory.settingsList"
                          :key="settingKey"
                          class="col-12 col-sm-6 col-lg-4"
                        >
                          <div
                            class="dialogProgramSettings__setting"
                            :data-test-locator="`dialogProgramSettings-setting-${settingKey}`"
                            :data-test-setting-id="String(settingKey)"
                            :data-test-tags="setting.tags"
                          >
                            <div class="row items-center no-wrap q-mb-xs">
                              <div class="dialogProgramSettings__settingTitle">
                                <span
                                  class="dialogProgramSettings__settingLabel text-grey-3 text-weight-regular text-body2"
                                  data-test-locator="dialogProgramSettings-settingLabel"
                                >{{ setting.title }}</span>
                                <q-icon
                                  name="mdi-help-circle"
                                  size="16px"
                                  class="dialogProgramSettings__settingHelpIcon q-ml-md"
                                  :data-test-tooltip-text="setting.description"
                                >
                                  <q-tooltip
                                    :delay="500"
                                  >
                                    {{ setting.description }}
                                  </q-tooltip>
                                </q-icon>
                              </div>
                            </div>
                            <q-toggle
                              color="primary-bright"
                              :model-value="setting.value"
                              @update:model-value="(value) => updateLocalSetting(settingKey, value)"
                            />
                            <p
                              v-if="setting.note !== undefined && setting.note !== ''"
                              class="dialogProgramSettings__settingNote text-caption q-mt-xs q-mb-none text-red-12"
                              data-test-locator="dialogProgramSettings-settingNote"
                            >
                              {{ setting.note }}
                            </p>
                          </div>
                        </div>
                      </div>

                      <q-separator
                        v-if="showNonLastSeparator(category.subCategories, subCategoryIndex)"
                        horizontal
                        class="q-mt-md"
                        color="primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>

          <Transition
            enter-active-class="animated fadeIn"
            leave-active-class="animated fadeOut"
          >
            <div
              v-if="hasActiveSearchQuery"
              class="dialogProgramSettings__searchAllSettingsPanel q-tab-panel q-pa-none"
              data-test-locator="dialogProgramSettings-searchAllSettingsPanel"
            >
              <div class="dialogProgramSettings__panelScroll hasScrollbar">
                <div class="dialogProgramSettings__panelScrollInner q-py-sm">
                  <template
                    v-for="(category, categoryKey, categoryIndex) in programSettingsTree"
                    :key="categoryKey"
                  >
                    <div
                      class="dialogProgramSettings__category"
                      :data-test-locator="`dialogProgramSettings-search-category-${categoryKey}`"
                    >
                      <h5
                        class="dialogProgramSettings__categoryTitle text-bold q-my-none text-h6"
                        data-test-locator="dialogProgramSettings-search-categoryTitle"
                      >
                        {{ category.title }}
                      </h5>

                      <div
                        v-for="(subCategory, subCategoryKey, subCategoryIndex) in category.subCategories"
                        :key="subCategoryKey"
                        class="dialogProgramSettings__subCategory"
                        :data-test-locator="`dialogProgramSettings-search-subcategory-${categoryKey}-${subCategoryKey}`"
                      >
                        <h6
                          class="dialogProgramSettings__subCategoryTitle text-bold q-mb-none text-subtitle1 text-primary-bright"
                          data-test-locator="dialogProgramSettings-search-subcategoryTitle"
                        >
                          {{ subCategory.title }}
                        </h6>

                        <div class="row q-col-gutter-md">
                          <div
                            v-for="(setting, settingKey) in subCategory.settingsList"
                            :key="settingKey"
                            class="col-12 col-sm-6 col-lg-4"
                          >
                            <div
                              class="dialogProgramSettings__setting"
                              :data-test-locator="`dialogProgramSettings-search-setting-${settingKey}`"
                              :data-test-setting-id="String(settingKey)"
                              :data-test-tags="setting.tags"
                            >
                              <div class="row items-center no-wrap q-mb-xs">
                                <div class="dialogProgramSettings__settingTitle">
                                  <span
                                    class="dialogProgramSettings__settingLabel text-grey-3 text-weight-regular text-body2"
                                    data-test-locator="dialogProgramSettings-search-settingLabel"
                                  >{{ setting.title }}</span>
                                  <q-icon
                                    name="mdi-help-circle"
                                    size="16px"
                                    class="dialogProgramSettings__settingHelpIcon q-ml-md"
                                    :data-test-tooltip-text="setting.description"
                                  >
                                    <q-tooltip
                                      :delay="500"
                                    >
                                      {{ setting.description }}
                                    </q-tooltip>
                                  </q-icon>
                                </div>
                              </div>
                              <q-toggle
                                color="primary-bright"
                                :model-value="setting.value"
                                @update:model-value="(value) => updateLocalSetting(settingKey, value)"
                              />
                              <p
                                v-if="setting.note !== undefined && setting.note !== ''"
                                class="dialogProgramSettings__settingNote text-caption q-mt-xs q-mb-none text-red-12"
                                data-test-locator="dialogProgramSettings-search-settingNote"
                              >
                                {{ setting.note }}
                              </p>
                            </div>
                          </div>
                        </div>

                        <q-separator
                          v-if="showNonLastSeparator(category.subCategories, subCategoryIndex)"
                          horizontal
                          class="q-mt-md"
                          color="primary"
                        />
                      </div>

                      <q-separator
                        v-if="showNonLastTopCategorySeparator(programSettingsTree, categoryIndex)"
                        horizontal
                        class="q-my-lg"
                        color="primary"
                      />
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </q-card-section>

      <!-- Card actions wrapper -->
      <q-card-actions
        align="right"
        class="q-mb-lg q-px-md q-gutter-sm dialogProgramSettings__cardActions"
      >
        <q-btn
          v-close-popup
          flat
          :label="$t('dialogs.programSettings.closeButton')"
          class="q-mr-xl"
          color="accent"
          data-test-locator="dialogProgramSettings-button-close"
        />

        <q-btn
          outline
          :label="$t('dialogs.programSettings.saveButton')"
          color="primary-bright"
          data-test-locator="dialogProgramSettings-button-save"
          @click="saveAndCloseDialog"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { I_faUserSettings } from 'app/types/I_faUserSettings'
import type { T_dialogName } from 'app/types/T_dialogList'
import type { T_programSettingsRenderTree } from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.types'
import type { StoreGeneric } from 'pinia'
import {
  syncLocalProgramSettingsFromStore,
  updateLocalProgramSetting
} from 'app/src/components/dialogs/DialogProgramSettings/scripts/programSettingsLocalSettingsManagement'
import {
  showNonLastSeparator,
  showNonLastTopCategorySeparator
} from 'app/src/components/dialogs/DialogProgramSettings/scripts/programSettingsHelpers'
import { S_DialogComponent } from 'src/stores/S_Dialog'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'
import { computed, onMounted, ref, toRaw, watch } from 'vue'

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

/**
 * Program settings tree
 */
const programSettingsTree = ref<T_programSettingsRenderTree>({})

/**
 * Selected category tab
 */
const selectedCategoryTab = ref<string>('')

/**
 * Settings search / filter field (bound to the header q-input).
 */
const searchSettingsQuery = ref<string | null>('')

/**
 * True when the search field has non-whitespace text (drives the tabs dimming overlay).
 * Clearable q-input sets the model to null when cleared; normalize before trim.
 */
const hasActiveSearchQuery = computed(
  () => (searchSettingsQuery.value ?? '').trim() !== ''
)

/**
 * Opens the popup dialog via direct input-feed
 */
const openDialog = (input: T_dialogName) => {
  documentName.value = input
  dialogModel.value = true
  searchSettingsQuery.value = ''
  void syncLocalProgramSettingsFromStore(localSettings, programSettingsTree)
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
 * Updates the local setting value
 */
const updateLocalSetting = (settingKey: string, updatedValue: boolean): void => {
  updateLocalProgramSetting(localSettings, programSettingsTree, settingKey, updatedValue)
}

/**
 * Watches the program settings tree and updates the selected category tab
 */
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
 * On first mount, opens the dialog when 'directInput' is already set (stabilizes component tests that feed props before mount).
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
    position: relative;
    width: 1400px;
  }

  .dialogProgramSettings__title {
    z-index: 11;
  }

  .dialogProgramSettings__titleSection {
    flex-shrink: 0;
  }

  .dialogProgramSettings__body {
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
  }

  .dialogProgramSettings__tabPanelsHost {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
    position: relative;
  }

  .dialogProgramSettings__searchAllSettingsPanel {
    background: $dark;
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    inset: 0;
    max-height: 100%;
    min-height: 0;
    overflow: hidden;
    position: absolute;
    z-index: 10;

    &::before {
      background: linear-gradient(360deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 100%);
      content: '';
      height: 10px;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
      z-index: 0;
    }

    &::after {
      background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 100%);
      bottom: 0;
      content: '';
      height: 10px;
      left: 0;
      position: absolute;
      right: 0;
      z-index: 0;
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

  .dialogProgramSettings__panelScroll {
    flex: 1 1 auto;
    height: 100%;
    min-height: 0;
    overflow: hidden auto;
  }

  .q-tabs--vertical .q-tab {
    padding: 0 16px;
  }

  .dialogProgramSettings__tabs {
    position: relative;
  }

  .dialogProgramSettings__tabsSearchOverlay {
    background: rgba(0, 0, 0, 0.3);
    inset: 0 0 0 0;
    pointer-events: none;
    position: absolute;
    z-index: 10;
  }

  .dialogProgramSettings__tabs--nonInteractive {
    pointer-events: none;
  }

  .dialogProgramSettings__category {
    padding: 30px 40px 0;
  }

  .dialogProgramSettings__categoryTitle {
    background: $dark;
    left: 40px;
    padding-bottom: 8px;
    padding-top: 8px;
    position: absolute;
    right: 40px;
    top: 0;
    z-index: 5;
  }

  .dialogProgramSettings__settingTitle {
    align-items: center;
    display: flex;
    font-weight: 500;
    justify-content: flex-start;
    margin-bottom: 8px;
    margin-left: 10px;
    margin-top: 16px;
    width: calc(100% - 45px);
  }

  .dialogProgramSettings__settingLabel {
  }

  .dialogProgramSettings__settingHelpIcon {
    align-self: flex-start;
    margin-top: 3px;
  }

  .dialogProgramSettings__settingHelp {
  }

  .dialogProgramSettings__settingNote {
    margin-left: 10px;
    text-shadow: 0 0 2px black;
  }

  /* Fixed width so clearable append slot does not widen the field when it mounts. */
  .dialogProgramSettings__settingsSearchInput {
    width: 100%;
  }

  .dialogProgramSettings__settingsSearchWrapper {
    background-color: $dark;
    pointer-events: auto;
    position: absolute;
    right: 45px;
    top: 4px;
    width: min(220px, calc(100vw - 120px));
    z-index: 11;

    &::before {
      border-bottom-left-radius: 5px;
      box-shadow: -5px 5px 7px rgba(0, 0, 0, 0.1);
      content: "";
      inset: -5px -35px -5px -10px;
      opacity: 0;
      position: absolute;
      transition: opacity 0.1s ease;
      z-index: 0;
    }

    &::after {
      content: "";
      height: 10px;
      left: -10px;
      opacity: 0;
      position: absolute;
      right: -35px;
      top: -4px;
      transition: opacity 0.1s ease;
    }
  }

  .dialogProgramSettings__searchAllSettingsPanel {
    .dialogProgramSettings__categoryTitle {
      margin-bottom: -11px;
      margin-top: -37px;
      position: static;
    }
  }

  .dialogProgramSettings__cardActions {
    z-index: 10;
  }

  &.hasActiveSearchQuery {
    .dialogProgramSettings__settingsSearchWrapper {
      &::after {
        background: linear-gradient(360deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 100%);
        content: "";
        opacity: 1;
      }

      &::before {
        background-color: $dark;
        content: "";
        opacity: 1;
      }
    }
  }
}
</style>
