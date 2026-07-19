<template>
  <div
    class="faLabeledBooleanToggle"
    :data-test-locator="testLocator"
  >
    <div class="row items-center no-wrap q-mb-xs">
      <div class="faLabeledBooleanToggle__title">
        <q-icon
          v-if="icon !== undefined && icon.length > 0"
          class="faLabeledBooleanToggle__leadingIcon q-mr-sm"
          :name="icon"
          size="20px"
        />
        <span
          class="faLabeledBooleanToggle__label fa-text-label text-body2"
          :data-test-locator="`${testLocator}-label`"
        >{{ title }}</span>
        <q-icon
          name="mdi-help-circle"
          size="16px"
          class="faLabeledBooleanToggle__helpIcon q-ml-md"
          :data-test-tooltip-text="description"
        >
          <q-tooltip>
            {{ description }}
          </q-tooltip>
        </q-icon>
      </div>
    </div>
    <q-toggle
      color="primary-bright"
      :disable="disabled"
      :model-value="modelValue"
      :data-test-locator="`${testLocator}-toggle`"
      @update:model-value="onToggle"
    />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'FaLabeledBooleanToggle'
})

const props = defineProps<{
  description: string
  disabled?: boolean
  icon?: string
  modelValue: boolean
  testLocator: string
  title: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function onToggle (value: boolean): void {
  if (props.disabled === true) {
    return
  }
  emit('update:modelValue', value)
}
</script>

<style lang="scss" scoped>
.faLabeledBooleanToggle__title {
  align-items: center;
  display: flex;
  justify-content: flex-start;
}

.faLabeledBooleanToggle__helpIcon {
  align-self: flex-start;
}
</style>
