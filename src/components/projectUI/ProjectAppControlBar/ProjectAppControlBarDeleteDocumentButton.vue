<template>
  <div class="projectAppControlBarDeleteDocumentAction">
    <q-separator
      v-if="showLeadingSeparator"
      vertical
      aria-hidden="true"
      class="projectAppControlBar__actionSeparator"
      data-test-locator="projectAppControlBar-deleteActionSeparator"
    />
    <q-btn
      color="secondary"
      data-test-locator="projectAppControlBar-deleteDocumentButton"
      icon="mdi-text-box-remove-outline"
      outline
      @click="emit('click')"
    >
      <q-tooltip
        anchor="bottom middle"
        class="projectAppControlBar__buttonTooltip"
        :delay="500"
        self="top middle"
      >
        {{ tooltipLabel }}
      </q-tooltip>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProjectAppControlBarDeleteDocumentButton'
})

defineProps<{
  showLeadingSeparator: boolean
  tooltipLabel: string
}>()

const emit = defineEmits<{
  click: []
}>()
</script>
