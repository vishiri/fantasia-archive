<template>
  <div
    v-if="documentTab !== null"
    class="documentWorkspacePageOrderNumberField documentWorkspacePage__orderNumberField documentWorkspacePage__field dialogProjectSettings__field q-mt-md"
  >
    <div class="documentWorkspacePageOrderNumberField__title documentWorkspacePage__fieldTitle">
      <span
        class="documentWorkspacePageOrderNumberField__label documentWorkspacePage__fieldLabel fa-text-label text-body2"
        data-test-locator="documentWorkspacePage-orderNumberLabel"
      >
        {{ orderNumberFieldLabel }}
      </span>
      <q-icon
        name="mdi-file-tree"
        size="16px"
        class="documentWorkspacePageOrderNumberField__titleIcon documentWorkspacePage__fieldHelpIcon q-ml-md"
        data-test-locator="documentWorkspacePage-orderNumberTitleIcon"
      />
      <q-icon
        name="mdi-help-circle"
        size="16px"
        class="documentWorkspacePageOrderNumberField__helpIcon documentWorkspacePage__fieldHelpIcon q-ml-md"
        data-test-locator="documentWorkspacePage-orderNumberHelpIcon"
        :data-test-tooltip-text="orderNumberFieldDescription"
      >
        <q-tooltip>
          {{ orderNumberFieldDescription }}
        </q-tooltip>
      </q-icon>
    </div>
    <q-input
      v-model="orderNumberModel"
      class="documentWorkspacePageOrderNumberField__input documentWorkspacePage__orderNumberInput"
      data-test-locator="documentWorkspacePage-orderNumberInput"
      dense
      :disable="orderNumberFieldReadOnly"
      :readonly="orderNumberFieldReadOnly"
      outlined
      type="number"
    />
  </div>
</template>

<script lang="ts" setup>
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

defineOptions({
  name: 'DocumentWorkspacePageOrderNumberField'
})

defineProps<{
  documentTab: I_faOpenedDocumentTab | null
  orderNumberFieldDescription: string
  orderNumberFieldLabel: string
  orderNumberFieldReadOnly: boolean
}>()

const orderNumberModel = defineModel<string>('orderNumberModel', {
  required: true
})
</script>
