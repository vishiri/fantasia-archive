<template>
  <div
    v-if="documentTab !== null"
    class="documentWorkspacePageBelongsUnderField documentWorkspacePage__belongsUnderField documentWorkspacePage__field dialogProjectSettings__field q-mt-md"
  >
    <div class="documentWorkspacePageBelongsUnderField__title documentWorkspacePage__fieldTitle">
      <span
        class="documentWorkspacePageBelongsUnderField__label documentWorkspacePage__fieldLabel fa-text-label text-body2"
        data-test-locator="documentWorkspacePage-belongsUnderLabel"
      >
        {{ belongsUnderFieldLabel }}
      </span>
      <q-icon
        name="mdi-help-circle"
        size="16px"
        class="documentWorkspacePageBelongsUnderField__helpIcon documentWorkspacePage__fieldHelpIcon q-ml-md"
        data-test-locator="documentWorkspacePage-belongsUnderHelpIcon"
        :data-test-tooltip-text="belongsUnderFieldDescription"
      >
        <q-tooltip>
          {{ belongsUnderFieldDescription }}
        </q-tooltip>
      </q-icon>
      <q-icon
        name="mdi-arrow-right-bold"
        size="17px"
        color="amber-14"
        class="documentWorkspacePageBelongsUnderField__oneWayIcon documentWorkspacePage__fieldHelpIcon q-ml-md"
        data-test-locator="documentWorkspacePage-belongsUnderOneWayIcon"
        :data-test-tooltip-text="oneWayRelationshipTooltip"
      >
        <q-tooltip>
          {{ oneWayRelationshipTooltip }}
        </q-tooltip>
      </q-icon>
    </div>
    <q-input
      v-model="belongsUnderModel"
      class="documentWorkspacePageBelongsUnderField__input documentWorkspacePage__belongsUnderInput"
      data-test-locator="documentWorkspacePage-belongsUnderInput"
      dense
      :disable="belongsUnderFieldReadOnly"
      :readonly="belongsUnderFieldReadOnly"
      outlined
    />
  </div>
</template>

<script lang="ts" setup>
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

defineOptions({
  name: 'DocumentWorkspacePageBelongsUnderField'
})

defineProps<{
  belongsUnderFieldDescription: string
  belongsUnderFieldLabel: string
  belongsUnderFieldReadOnly: boolean
  documentTab: I_faOpenedDocumentTab | null
  oneWayRelationshipTooltip: string
}>()

const belongsUnderModel = defineModel<string>('belongsUnderModel', {
  required: true
})
</script>
