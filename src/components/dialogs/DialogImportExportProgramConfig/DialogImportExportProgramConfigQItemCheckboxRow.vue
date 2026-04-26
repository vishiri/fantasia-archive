<template>
  <q-item
    tag="label"
    class="importExportProgramConfigQItemCheckboxRow flex justify-center"
    :class="{
      'importExportProgramConfigQItemCheckboxRow--isDisabled': isDisabled
    }"
    :aria-disabled="isDisabled || undefined"
  >
    <q-item-section avatar>
      <q-checkbox
        v-model="model"
        :color="checkboxColor"
        :data-test-locator="dataTestLocator"
        :disable="isDisabled"
      />
    </q-item-section>
    <q-item-section
      avatar
      class="importExportProgramConfig__checkboxLabel"
    >
      <q-item-label
        class="importExportProgramConfig__label"
        :class="{
          'fa-text-checkbox-idle': !model && !isDisabled,
          'fa-text-checkbox-disabled': !model && isDisabled
        }"
      >
        {{ $t(labelI18nKey) }}
      </q-item-label>
    </q-item-section>

    <q-item-section avatar>
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
  /** Full vue-i18n key, e.g. 'dialogs.importExportProgramConfig.checkboxes.programSettings' */
  labelI18nKey: string
  disabled?: boolean
}>()

/** Quasar `QItem` `disabled` dims the whole row; do not set it for interactive rows. */
const isDisabled = computed(() => props.disabled === true)
</script>

<style lang="scss" scoped>
.importExportProgramConfigQItemCheckboxRow {
  &--isDisabled {
    cursor: not-allowed;
    pointer-events: none;
  }
}

.q-item__section--side {
  min-width: 0;
  padding-right: 0;
}

.q-checkbox {
  margin: 0 8px;
}

.importExportProgramConfig__label {
  transition: color 0.3s cubic-bezier(0.4, 0, 0.6, 1) 0ms;
}
</style>
