<template>
  <div
    v-if="documentTab !== null"
    class="documentWorkspacePageExtraHtmlClassesField documentWorkspacePage__extraHtmlClassesField documentWorkspacePage__field dialogProjectSettings__field q-mt-md"
  >
    <div class="documentWorkspacePageExtraHtmlClassesField__title documentWorkspacePage__fieldTitle">
      <span
        class="documentWorkspacePageExtraHtmlClassesField__label documentWorkspacePage__fieldLabel fa-text-label text-body2"
        data-test-locator="documentWorkspacePage-extraHtmlClassesLabel"
      >
        {{ extraHtmlClassesFieldLabel }}
      </span>
      <q-icon
        name="mdi-language-css3"
        size="16px"
        class="documentWorkspacePageExtraHtmlClassesField__titleIcon documentWorkspacePage__fieldTitleIcon documentWorkspacePage__fieldHelpIcon fa-color-glyph q-ml-md"
        data-test-locator="documentWorkspacePage-extraHtmlClassesTitleIcon"
      />
      <FaHelpTooltipIcon
        class="documentWorkspacePageExtraHtmlClassesField__helpIcon documentWorkspacePage__fieldHelpIcon q-ml-md"
        data-test-locator="documentWorkspacePage-extraHtmlClassesHelpIcon"
        :data-test-tooltip-text="extraHtmlClassesFieldDescription"
      >
        <q-tooltip>
          {{ extraHtmlClassesFieldDescription }}
        </q-tooltip>
      </FaHelpTooltipIcon>
    </div>
    <q-input
      v-model="extraHtmlClassesModel"
      class="documentWorkspacePageExtraHtmlClassesField__input documentWorkspacePage__extraHtmlClassesInput"
      data-test-locator="documentWorkspacePage-extraHtmlClassesInput"
      dense
      :disable="extraHtmlClassesFieldReadOnly"
      :readonly="extraHtmlClassesFieldReadOnly"
      outlined
    />
  </div>
</template>

<script lang="ts" setup>
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import FaHelpTooltipIcon from 'app/src/components/elements/FaHelpTooltipIcon/FaHelpTooltipIcon.vue'

defineOptions({
  name: 'DocumentWorkspacePageExtraHtmlClassesField'
})

defineProps<{
  documentTab: I_faOpenedDocumentTab | null
  extraHtmlClassesFieldDescription: string
  extraHtmlClassesFieldLabel: string
  extraHtmlClassesFieldReadOnly: boolean
}>()

const extraHtmlClassesModel = defineModel<string>('extraHtmlClassesModel', {
  required: true
})
</script>
