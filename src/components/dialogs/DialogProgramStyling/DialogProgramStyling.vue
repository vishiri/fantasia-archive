<template>
  <q-dialog
    v-model="dialogModel"
    persistent
    :class="['dialogComponent', documentName, 'dialogProgramStyling']"
    aria-labelledby="dialogProgramStyling-title"
    @show="onDialogShow"
    @hide="onDialogHide"
  >
    <q-card
      :class="['dialogComponent__wrapper', documentName, 'dialogProgramStyling__card']"
    >
      <div class="dialogProgramStyling__titleRow">
        <h4
          id="dialogProgramStyling-title"
          class="text-center dialogProgramStyling__title"
          data-test-locator="dialogProgramStyling-title"
        >
          {{ $t('dialogs.programStyling.title') }}
        </h4>

        <q-icon
          name="mdi-help-circle"
          size="23px"
          class="dialogProgramStyling__helpIcon"
          role="img"
          color="primary-bright"
          :aria-label="$t('dialogs.programStyling.helpTooltip.aria')"
          data-test-locator="dialogProgramStyling-helpIcon"
        >
          <q-tooltip
            anchor="bottom right"
            self="top right"
            :delay="500"
            :offset="[0, 10]"
            class="dialogProgramStyling__helpTooltip"
          >
            <div
              class="dialogProgramStyling__helpTooltipBody"
              data-test-locator="dialogProgramStyling-helpTooltipBody"
            >
              <strong class="dialogProgramStyling__helpTooltipTitle">
                {{ $t('dialogs.programStyling.helpTooltip.title') }}
              </strong>
              <ul class="dialogProgramStyling__helpTooltipList">
                <li
                  v-for="item in monacoKeybindHelpItems"
                  :key="item.labelKey"
                  class="dialogProgramStyling__helpTooltipItem"
                >
                  <span class="dialogProgramStyling__helpTooltipChord">{{ item.chord }}</span>
                  <span class="dialogProgramStyling__helpTooltipLabel">
                    {{ $t(`dialogs.programStyling.helpTooltip.items.${item.labelKey}`) }}
                  </span>
                </li>
              </ul>
              <p class="dialogProgramStyling__helpTooltipFooter">
                {{ $t('dialogs.programStyling.helpTooltip.footer') }}
              </p>
            </div>
          </q-tooltip>
        </q-icon>
      </div>

      <q-card-section class="q-pa-none dialogProgramStyling__body">
        <div
          ref="editorHostRef"
          class="dialogProgramStyling__editorHost"
          data-test-locator="dialogProgramStyling-editorHost"
        />

        <div
          v-if="monaco.isLoading.value"
          class="dialogProgramStyling__loadingOverlay"
          data-test-locator="dialogProgramStyling-loadingOverlay"
        >
          <q-spinner-dots
            color="primary-bright"
            size="48px"
          />
          <span class="q-ml-md">{{ $t('dialogs.programStyling.loading') }}</span>
        </div>

        <div
          v-if="monaco.loadError.value !== null"
          class="dialogProgramStyling__loadError text-negative"
          data-test-locator="dialogProgramStyling-loadError"
        >
          {{ monaco.loadError.value }}
        </div>
      </q-card-section>

      <q-card-actions
        align="right"
        class="q-mb-sm q-mt-none q-px-md q-gutter-sm dialogProgramStyling__cardActions"
      >
        <q-btn
          flat
          color="accent"
          class="q-mr-xl"
          :label="$t('dialogs.programStyling.closeWithoutSaving')"
          data-test-locator="dialogProgramStyling-button-close"
          @click="closeWithoutSaving"
        />
        <q-btn
          color="primary-bright"
          outline
          :label="$t('dialogs.programStyling.saveButton')"
          data-test-locator="dialogProgramStyling-button-save"
          @click="saveAndCloseDialog"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { getMonacoKeybindHelpItems } from 'app/src/components/dialogs/DialogProgramStyling/scripts/dialogProgramStylingKeybindHelp'
import { useDialogProgramStyling } from 'app/src/components/dialogs/DialogProgramStyling/scripts/dialogProgramStylingState'
import { registerComponentDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/dialogManagement'

const props = defineProps<{
  /**
   * Allows direct mounting of this dialog (Storybook / Playwright component test) without going through the global dialog store.
   */
  directInput?: T_dialogName
}>()

const {
  closeWithoutSaving,
  dialogModel,
  documentName,
  editorHostRef,
  monaco,
  onDialogHide,
  onDialogShow,
  saveAndCloseDialog
} = useDialogProgramStyling(props)

/**
 * Reactive so the chord text re-evaluates if the keybinds snapshot lands while the dialog is open
 * (e.g. after the first 'S_FaKeybinds().refreshKeybinds()' resolves on app startup).
 */
const monacoKeybindHelpItems = computed(() => getMonacoKeybindHelpItems())

registerComponentDialogStackGuard(dialogModel)
</script>

<style lang="scss">
.dialogProgramStyling {
  .dialogComponent__wrapper {
    display: flex;
    flex-direction: column;
    height: $dialogProgramStyling-card-height;
    max-height: calc(100vh - #{$dialogProgramStyling-card-maxHeightViewportSubtract}) !important;
    max-width: calc(100vw - #{$dialogProgramStyling-card-maxWidthViewportSubtract}) !important;
    overflow: hidden;
    position: relative;
    width: $dialogProgramStyling-card-width;
  }

  &__titleRow {
    flex: 0 0 auto;
    position: relative;
  }

  &__title {
    flex: 0 0 auto;
  }

  &__helpIcon {
    bottom: $dialogProgramStyling-helpIcon-bottom;
    position: absolute;
    right: $dialogProgramStyling-helpIcon-right;
    z-index: $dialogProgramStyling-helpIcon-zIndex;
  }

  &__helpTooltip {
    max-width: $dialogProgramStyling-helpTooltip-width;
    width: $dialogProgramStyling-helpTooltip-width;
  }

  &__helpTooltipBody {
    display: flex;
    flex-direction: column;
    font-size: $dialogProgramStyling-helpTooltipBody-fontSize;
    gap: $dialogProgramStyling-helpTooltipBody-gap;
    padding: $dialogProgramStyling-helpTooltipBody-padding;
  }

  &__helpTooltipTitle {
    font-size: $dialogProgramStyling-helpTooltipTitle-fontSize;
    font-weight: $dialogProgramStyling-helpTooltipTitle-fontWeight;
    margin-bottom: $dialogProgramStyling-helpTooltipTitle-marginBottom;
  }

  &__helpTooltipList {
    display: grid;
    font-weight: $dialogProgramStyling-helpTooltipList-fontWeight;
    gap: $dialogProgramStyling-helpTooltipList-gap;
    grid-template-columns: max-content 1fr;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__helpTooltipItem {
    display: contents;
  }

  &__helpTooltipChord {
    font-style: italic;
    font-weight: $dialogProgramStyling-helpTooltipChord-fontWeight;
    white-space: nowrap;
  }

  &__helpTooltipLabel {
    font-weight: $dialogProgramStyling-helpTooltipList-fontWeight;
    line-height: $dialogProgramStyling-helpTooltipLabel-lineHeight;
    margin-left: $dialogProgramStyling-helpTooltipLabel-marginLeft;
  }

  &__helpTooltipFooter {
    font-style: italic;
    font-weight: 400;
    line-height: $dialogProgramStyling-helpTooltipFooter-lineHeight;
    margin: $dialogProgramStyling-helpTooltipFooter-margin;
    opacity: 1;
  }

  &__body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    position: relative;
  }

  &__editorHost {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
  }

  &__loadingOverlay {
    align-items: center;
    background: $dialogProgramStyling-loadingOverlay-background;
    display: flex;
    inset: 0;
    justify-content: center;
    pointer-events: none;
    position: absolute;
  }

  &__loadError {
    padding: $dialogProgramStyling-loadError-padding;
  }

  &__cardActions {
    flex: 0 0 auto;
  }
}
</style>
