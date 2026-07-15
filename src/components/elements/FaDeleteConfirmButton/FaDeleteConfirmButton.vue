<template>
  <q-btn
    outline
    class="faDeleteConfirmButton"
    :class="props.buttonClass"
    color="secondary"
    :disable="props.removeDisabled"
    :label="$t(props.deleteButtonLabelKey)"
    :data-test-locator="props.removeButtonTestLocator"
    :no-caps="props.noCaps"
  >
    <q-tooltip v-if="props.removeDisabled && props.removeDisabledTooltipKey">
      {{ $t(props.removeDisabledTooltipKey) }}
    </q-tooltip>

    <q-menu
      v-if="!props.removeDisabled"
      v-model="menuOpen"
      anchor="bottom middle"
      class="faDeleteConfirmButton__confirmMenu"
      dark
      :data-test-locator="props.confirmMenuTestLocator"
      no-focus
      :offset="menuOffset"
      self="top middle"
      transition-hide="fade"
      transition-show="fade"
    >
      <div class="faDeleteConfirmButton__confirmInner">
        <p
          class="faDeleteConfirmButton__confirmMessage"
          :data-test-locator="props.confirmMessageTestLocator"
        >
          {{ $t(props.deleteConfirmMessageKey) }}
        </p>
        <div class="faDeleteConfirmButton__confirmActions">
          <q-btn
            outline
            class="faDeleteConfirmButton__confirmButton"
            :class="confirmDeleteCountdownActiveClass"
            color="secondary"
            :data-test-locator="props.confirmButtonTestLocator"
            :disable="confirmDeleteDisabled"
            @click="onConfirmDeleteClick"
          >
            <span class="faDeleteConfirmButton__confirmLabel">
              {{ $t(props.deleteConfirmConfirmButtonKey) }}
            </span>
            <span
              v-if="confirmDeleteDisabled"
              class="faDeleteConfirmButton__countdown"
              :data-test-locator="props.countdownTestLocator"
            >
              {{ secondsRemaining }}
            </span>
          </q-btn>
        </div>
      </div>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useFaDeleteConfirmButton } from './scripts/faDeleteConfirmButton_manager'

defineOptions({
  name: 'FaDeleteConfirmButton'
})

const props = withDefaults(
  /* eslint-disable vue/require-default-prop -- exactOptionalPropertyTypes: omit undefined from withDefaults */
  defineProps<{
    buttonClass?: string
    confirmButtonTestLocator: string
    confirmMenuTestLocator: string
    confirmMessageTestLocator: string
    countdownTestLocator: string
    deleteButtonLabelKey: string
    deleteConfirmConfirmButtonKey: string
    deleteConfirmMessageKey: string
    noCaps?: boolean
    removeButtonTestLocator: string
    removeDisabled: boolean
    removeDisabledTooltipKey?: string
  }>(),
  {
    noCaps: false
  }
)

const emit = defineEmits<{
  confirm: []
}>()

const {
  confirmDeleteDisabled,
  menuOffset,
  menuOpen,
  onConfirmDelete,
  secondsRemaining
} = useFaDeleteConfirmButton()

const confirmDeleteCountdownActiveClass = computed(() => {
  if (confirmDeleteDisabled.value) {
    return 'faDeleteConfirmButton__confirmButton--countdownActive'
  }
  return null
})

function onConfirmDeleteClick (): void {
  onConfirmDelete(() => {
    emit('confirm')
  })
}
</script>

<style lang="scss" src="./styles/FaDeleteConfirmButton.unscoped.scss"></style>

<style lang="scss" scoped>
.faDeleteConfirmButton {
  min-height: auto;
  padding:
    $dialogProjectSettings-worldsDeleteButton-paddingY
    $dialogProjectSettings-worldsDeleteButton-paddingX;

  :deep(.q-btn__content) {
    min-height: auto;
    padding: 0;
  }
}
</style>
