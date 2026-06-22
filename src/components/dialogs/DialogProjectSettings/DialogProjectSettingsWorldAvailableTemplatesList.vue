<template>
  <div
    class="dialogProjectSettingsWorldAvailableTemplatesList hasScrollbar"
    data-test-locator="dialogProjectSettings-worldAvailableTemplatesList"
  >
    <q-list
      v-if="props.templates.length > 0"
      dark
    >
      <q-item
        v-for="template in props.templates"
        :key="template.id"
        v-ripple
        clickable
        class="dialogProjectSettingsWorldAvailableTemplatesList__item"
        :data-test-locator="`dialogProjectSettings-worldAvailableTemplate-${template.id}`"
        @click="emitAddTemplate(template.id)"
        @contextmenu.prevent="onItemContextMenu"
      >
        <q-item-section>
          <div class="dialogProjectSettingsWorldAvailableTemplatesList__itemBody column">
            <div class="dialogProjectSettingsWorldAvailableTemplatesList__titleRow row items-center no-wrap">
              <q-icon
                class="dialogProjectSettingsWorldAvailableTemplatesList__icon"
                :name="resolveDialogProjectSettingsDocumentTemplateDisplayIcon(
                  template.icon,
                  FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON
                )"
              />
              <q-item-label class="dialogProjectSettingsWorldAvailableTemplatesList__label col">
                {{ resolveTemplateLabel(template) }}
              </q-item-label>
            </div>
            <div
              v-if="resolveTemplateWorldAppendix(template).length > 0"
              class="dialogProjectSettingsWorldAvailableTemplatesList__affixRow row no-wrap"
            >
              <span
                aria-hidden="true"
                class="dialogProjectSettingsWorldAvailableTemplatesList__affixIndent"
              />
              <q-item-label
                caption
                class="dialogProjectSettingsWorldAvailableTemplatesList__appendix fa-text-muted col"
              >
                ({{ resolveTemplateWorldAppendix(template) }})
              </q-item-label>
            </div>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
    <div
      v-else-if="props.showFilterEmpty"
      class="dialogProjectSettingsWorldAvailableTemplatesList__empty fa-text-muted"
      data-test-locator="dialogProjectSettings-worldAvailableTemplatesFilterEmpty"
    >
      {{ $t('dialogs.projectSettings.fields.worldTemplateLayout.emptyFilteredAvailableTemplates') }}
    </div>
    <div
      v-else
      class="dialogProjectSettingsWorldAvailableTemplatesList__empty fa-text-muted"
      data-test-locator="dialogProjectSettings-worldAvailableTemplatesEmpty"
    >
      {{ $t('dialogs.projectSettings.fields.worldTemplateLayout.emptyAvailableTemplates') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import { FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON } from 'app/types/I_faIconPickerInput'
import { clearQuasarHoverableFocusState } from 'app/src/scripts/dom/functions/clearQuasarHoverableFocusState'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import { resolveDialogProjectSettingsDocumentTemplateResolvedTitle, resolveDialogProjectSettingsDocumentTemplateDisplayIcon } from './scripts/dialogProjectSettingsDocumentTemplatesDraft'
import { resolveDialogProjectSettingsDocumentTemplateResolvedWorldAppendix } from './scripts/dialogProjectSettingsDocumentTemplateWorldAppendixDraft'

defineOptions({
  name: 'DialogProjectSettingsWorldAvailableTemplatesList'
})

const props = defineProps<{
  currentLanguageCode: T_faUserSettingsLanguageCode
  showFilterEmpty?: boolean
  templates: I_dialogProjectSettingsDocumentTemplateDraft[]
}>()

const emit = defineEmits<{
  addTemplate: [templateId: string]
}>()

function resolveTemplateLabel (template: I_dialogProjectSettingsDocumentTemplateDraft): string {
  return resolveDialogProjectSettingsDocumentTemplateResolvedTitle(
    template,
    props.currentLanguageCode
  )
}

function resolveTemplateWorldAppendix (template: I_dialogProjectSettingsDocumentTemplateDraft): string {
  return resolveDialogProjectSettingsDocumentTemplateResolvedWorldAppendix(
    template,
    props.currentLanguageCode
  )
}

function emitAddTemplate (templateId: string): void {
  emit('addTemplate', templateId)
}

function onItemContextMenu (event: MouseEvent): void {
  const target = event.currentTarget
  clearQuasarHoverableFocusState(target instanceof HTMLElement ? target : null)
}
</script>

<style lang="scss" src="./styles/DialogProjectSettings.worldAvailableTemplatesList.unscoped.scss"></style>

<style lang="scss" scoped>
.dialogProjectSettingsWorldAvailableTemplatesList {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  width: 100%;
}

.dialogProjectSettingsWorldAvailableTemplatesList :deep(.q-list) {
  padding: 0;
}

.dialogProjectSettingsWorldAvailableTemplatesList__empty {
  padding-block: $dialogProjectSettings-worldTemplateLayout-availableListEmpty-paddingBlock;
  padding-inline: $dialogProjectSettings-worldTemplateLayout-availableCol-paddingInline;
}

.dialogProjectSettingsWorldAvailableTemplatesList__item {
  cursor: pointer;
  min-height: $dialogProjectSettings-worldTemplateLayout-availableListItem-minHeight;
  padding:
    $dialogProjectSettings-worldTemplateLayout-availableListItem-paddingBlock
    $dialogProjectSettings-worldTemplateLayout-availableCol-paddingInline;
}

.dialogProjectSettingsWorldAvailableTemplatesList__appendix {
  font-style: italic;
  min-width: 0;
}

.dialogProjectSettingsWorldAvailableTemplatesList__affixIndent {
  flex: 0 0 auto;
  width: $faQIconDisplay-iconLeadingWidth;
}

.dialogProjectSettingsWorldAvailableTemplatesList__affixRow {
  min-width: 0;
  width: 100%;
}

.dialogProjectSettingsWorldAvailableTemplatesList__itemBody {
  min-width: 0;
  width: 100%;
}

.dialogProjectSettingsWorldAvailableTemplatesList__label {
  min-width: 0;
}

.dialogProjectSettingsWorldAvailableTemplatesList__titleRow {
  min-width: 0;
  width: 100%;
}
</style>
