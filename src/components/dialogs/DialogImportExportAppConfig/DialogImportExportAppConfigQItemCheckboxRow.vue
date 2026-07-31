<template>
  <q-item
    tag="label"
    class="importExportAppConfigQItemCheckboxRow flex justify-center items-center"
    :class="{
      'importExportAppConfigQItemCheckboxRow--isDisabled': isDisabled
    }"
    :aria-disabled="isDisabled || undefined"
  >
    <!-- Label column -->
    <q-item-section class="importExportAppConfigQItemCheckboxRow__label">
      <q-item-label
        class="importExportAppConfigQItemCheckboxRow__labelText"
        :class="{
          'fa-text-checkbox-idle': !model && !isDisabled,
          'fa-text-checkbox-disabled': !model && isDisabled
        }"
      >
        {{ $t(labelI18nKey) }}
      </q-item-label>
    </q-item-section>

    <!-- Checkbox column (right) -->
    <q-item-section class="importExportAppConfigQItemCheckboxRow__checkbox">
      <q-checkbox
        v-model="model"
        :color="checkboxColor"
        :data-test-locator="dataTestLocator"
        :disable="isDisabled"
      />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const model = defineModel<boolean>({ required: true })

const props = defineProps<{
  checkboxColor: string
  dataTestLocator: string
  /** Full vue-i18n key, e.g. 'dialogs.importExportAppConfig.checkboxes.appSettings' */
  labelI18nKey: string
  disabled?: boolean
}>()

/** Quasar `QItem` `disabled` dims the whole row; do not set it for interactive rows. */
const isDisabled = computed(() => props.disabled === true)
</script>

<style lang="scss" scoped>
.importExportAppConfigQItemCheckboxRow {
  &--isDisabled {
    cursor: not-allowed;
    pointer-events: none;
  }

  &__label {
    align-items: flex-start;
    flex: 0 0 $dialogImportExportAppConfig-checkboxRow-labelWidth;
    justify-content: center;
    max-width: $dialogImportExportAppConfig-checkboxRow-labelWidth;
    min-width: $dialogImportExportAppConfig-checkboxRow-labelWidth;
    padding: 0;
    text-align: left;
  }

  &__labelText {
    text-align: left;
    transition: color 0.3s cubic-bezier(0.4, 0, 0.6, 1) 0ms;
    width: 100%;
  }

  &__checkbox {
    align-items: flex-start;
    flex: 0 0 $dialogImportExportAppConfig-checkboxRow-checkboxWidth;
    justify-content: center;
    max-width: $dialogImportExportAppConfig-checkboxRow-checkboxWidth;
    min-width: $dialogImportExportAppConfig-checkboxRow-checkboxWidth;
    padding: 0;
  }
}
</style>

<style lang="scss" src="./styles/DialogImportExportAppConfigQItemCheckboxRow.unscoped.scss"></style>
