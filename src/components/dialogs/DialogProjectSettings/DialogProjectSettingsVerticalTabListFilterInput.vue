<template>
  <q-input
    v-model="filterQuery"
    :class="filterInputClassList"
    color="primary-bright"
    dark
    dense
    hide-bottom-space
    :aria-label="$t(props.ariaLabelKey)"
    :data-test-locator="props.testLocatorInput"
    :placeholder="$t(props.placeholderKey)"
  >
    <template #prepend>
      <q-icon name="mdi-magnify" />
    </template>
    <template
      v-if="filterQuery.length > 0"
      #append
    >
      <q-btn
        color="negative"
        dense
        flat
        icon="mdi-close"
        round
        size="sm"
        :aria-label="$t(props.clearAriaLabelKey)"
        :data-test-locator="props.testLocatorClear"
        @click.stop="clearFilterQuery"
      />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'DialogProjectSettingsVerticalTabListFilterInput'
})

const props = withDefaults(defineProps<{
  ariaLabelKey?: string
  clearAriaLabelKey?: string
  placeholderKey?: string
  stretchToColumnEdge?: boolean
  testLocatorClear?: string
  testLocatorInput?: string
}>(), {
  ariaLabelKey: 'dialogs.projectSettings.fields.worldTemplateLayout.availableTemplatesFilterAriaLabel',
  clearAriaLabelKey: 'dialogs.projectSettings.fields.worldTemplateLayout.availableTemplatesFilterClearAriaLabel',
  placeholderKey: 'dialogs.projectSettings.fields.worldTemplateLayout.availableTemplatesFilterPlaceholder',
  stretchToColumnEdge: false,
  testLocatorClear: 'dialogProjectSettings-worldAvailableTemplatesFilterClear',
  testLocatorInput: 'dialogProjectSettings-worldAvailableTemplatesFilterInput'
})

const filterInputClassList = computed(() => ({
  dialogProjectSettingsVerticalTabListFilterInput: true,
  'dialogProjectSettingsVerticalTabListFilterInput--stretchToColumnEdge': props.stretchToColumnEdge
}))

const filterQuery = defineModel<string>({ default: '' })

function clearFilterQuery (): void {
  filterQuery.value = ''
}
</script>

<style lang="scss" src="./styles/DialogProjectSettings.verticalTabListFilterInput.unscoped.scss"></style>
