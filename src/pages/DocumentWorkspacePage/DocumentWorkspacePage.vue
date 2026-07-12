<template>
  <main
    class="documentWorkspacePage q-page column no-wrap q-pa-xl"
    data-test-locator="documentWorkspacePage"
  >
    <h4
      v-if="documentShowsPreview"
      class="documentWorkspacePage__previewTitle q-ma-none"
      data-test-locator="documentWorkspacePage-previewTitle"
    >
      {{ previewDisplayName }}
    </h4>
    <q-input
      v-if="documentShowsEditFields"
      v-model="displayNameModel"
      class="documentWorkspacePage__nameInput"
      data-test-locator="documentWorkspacePage-nameInput"
      :label="nameFieldLabel"
      outlined
      dense
    />

    <div
      v-if="documentTab !== null"
      class="documentWorkspacePage__colorFields"
    >
      <div class="documentWorkspacePage__field dialogProjectSettings__field">
        <span
          class="documentWorkspacePage__fieldLabel fa-text-label text-body2"
          data-test-locator="documentWorkspacePage-textColorLabel"
        >
          {{ textColorFieldLabel }}
        </span>
        <FaColorPickerInput
          v-model="textColorModel"
          :palette="worldPickerPalette"
          :palette-append="worldColorPaletteAppend"
          :read-only="documentColorPickersReadOnly"
          test-locator="documentWorkspacePage-textColorInput"
          @append-to-world-palette="onAppendToWorldPalette"
        />
      </div>

      <div class="documentWorkspacePage__field dialogProjectSettings__field">
        <span
          class="documentWorkspacePage__fieldLabel fa-text-label text-body2"
          data-test-locator="documentWorkspacePage-backgroundColorLabel"
        >
          {{ backgroundColorFieldLabel }}
        </span>
        <FaColorPickerInput
          v-model="backgroundColorModel"
          :palette="worldPickerPalette"
          :palette-append="worldColorPaletteAppend"
          :read-only="documentColorPickersReadOnly"
          test-locator="documentWorkspacePage-backgroundColorInput"
          @append-to-world-palette="onAppendToWorldPalette"
        />
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
import FaColorPickerInput from 'app/src/components/elements/FaColorPickerInput/FaColorPickerInput.vue'

import { useDocumentWorkspacePage } from './scripts/documentWorkspacePage_manager'

defineOptions({
  name: 'DocumentWorkspacePage'
})

const {
  backgroundColorFieldLabel,
  backgroundColorModel,
  displayNameModel,
  documentColorPickersReadOnly,
  documentShowsEditFields,
  documentShowsPreview,
  documentTab,
  nameFieldLabel,
  onAppendToWorldPalette,
  previewDisplayName,
  textColorFieldLabel,
  textColorModel,
  worldColorPaletteAppend,
  worldPickerPalette
} = useDocumentWorkspacePage()
</script>

<style lang="scss" scoped>
.documentWorkspacePage__colorFields {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
  max-width: 100%;
}

.documentWorkspacePage__field {
  max-width: 100%;
}

.documentWorkspacePage__fieldLabel {
  display: block;
  margin-bottom: 8px;
}
</style>
