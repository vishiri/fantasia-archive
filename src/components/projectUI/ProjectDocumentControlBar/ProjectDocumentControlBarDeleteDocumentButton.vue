<template>
  <div class="projectDocumentControlBarDeleteDocumentAction">
    <q-separator
      v-if="showLeadingSeparator"
      vertical
      aria-hidden="true"
      class="projectDocumentControlBar__actionSeparator"
      data-test-locator="projectDocumentControlBar-deleteActionSeparator"
    />
    <q-btn
      color="secondary"
      data-test-locator="projectDocumentControlBar-deleteDocumentButton"
      icon="mdi-text-box-remove-outline"
      outline
      @click="emit('click')"
    >
      <q-tooltip
        anchor="bottom middle"
        class="projectDocumentControlBar__buttonTooltip"
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
  name: 'ProjectDocumentControlBarDeleteDocumentButton'
})

defineProps<{
  showLeadingSeparator: boolean
  tooltipLabel: string
}>()

const emit = defineEmits<{
  click: []
}>()
</script>
