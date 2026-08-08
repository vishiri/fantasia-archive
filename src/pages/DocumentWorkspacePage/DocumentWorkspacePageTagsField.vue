<template>
  <div
    v-if="documentTab !== null"
    class="documentWorkspacePageTagsField documentWorkspacePage__tagsField documentWorkspacePage__field dialogProjectSettings__field q-mt-md"
  >
    <div class="documentWorkspacePageTagsField__title documentWorkspacePage__fieldTitle">
      <span
        class="documentWorkspacePageTagsField__label documentWorkspacePage__fieldLabel fa-text-label text-body2"
        data-test-locator="documentWorkspacePage-tagsLabel"
      >
        {{ tagsFieldLabel }}
      </span>
      <q-icon
        name="mdi-tag-multiple"
        size="16px"
        class="documentWorkspacePageTagsField__titleIcon documentWorkspacePage__fieldTitleIcon documentWorkspacePage__fieldHelpIcon fa-color-glyph q-ml-md"
        data-test-locator="documentWorkspacePage-tagsTitleIcon"
      />
      <FaHelpTooltipIcon
        class="documentWorkspacePageTagsField__helpIcon documentWorkspacePage__fieldHelpIcon q-ml-md"
        data-test-locator="documentWorkspacePage-tagsHelpIcon"
        :data-test-tooltip-text="tagsFieldDescription"
      >
        <q-tooltip>
          {{ tagsFieldDescription }}
        </q-tooltip>
      </FaHelpTooltipIcon>
    </div>
    <FaSelectInput
      v-model="tagsModel"
      allow-create-new
      clear-input-on-select
      :disable="tagsFieldReadOnly"
      mode="tags"
      multiple
      :options="tagsOptions"
      test-locator="documentWorkspacePage-tagsInput"
      @request-options="onTagsRequestOptions"
    />
  </div>
</template>

<script lang="ts" setup>
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faSelectInputObjectItem } from 'app/types/I_faSelectInput'
import FaHelpTooltipIcon from 'app/src/components/elements/FaHelpTooltipIcon/FaHelpTooltipIcon.vue'
import FaSelectInput from 'app/src/components/elements/FaSelectInput/FaSelectInput.vue'

defineOptions({
  name: 'DocumentWorkspacePageTagsField'
})

defineProps<{
  documentTab: I_faOpenedDocumentTab | null
  onTagsRequestOptions: () => void
  tagsFieldDescription: string
  tagsFieldLabel: string
  tagsFieldReadOnly: boolean
  tagsOptions: readonly I_faSelectInputObjectItem[]
}>()

const tagsModel = defineModel<I_faSelectInputObjectItem[]>('tagsModel', {
  required: true
})
</script>
