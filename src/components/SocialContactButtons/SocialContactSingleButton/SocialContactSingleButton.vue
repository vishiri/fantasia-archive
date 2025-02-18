<template>
  <q-btn
    :class="['socialContactSingleButton', buttonData.cssClass]"
    :title="buttonData.title"
    :href="buttonData.url"
    no-caps
    push
  >
    <div class="row items-center no-wrap">
      <q-img
        :src="`images/socialContactButtons/${buttonData.icon}`"
        fit="contain"
        :width="`${buttonData.width}px`"
        :height="`${buttonData.height}px`"
      />
      <div class="text-no-wrap socialContactSingleButton__text">
        {{ buttonData.label }}
      </div>
    </div>
  </q-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { I_socialContactButton } from 'app/types/I_socialContactButtons'

/**
 * All component props
 */
const props = defineProps<{
  /**
   * Data input for the component
   */
  dataInput: I_socialContactButton
}>()

/**
 * Testing type currently possibly happening
 */
const testingType = window.faContentBridgeAPIs.extraEnvVariables.TEST_ENV

/**
  * Data input for the component
  * - If testing type is "components", use test data, otherwise use prop data
  */
const componentData = computed(() => {
  if (testingType === 'components') {
    // TODO FIX THIS
    return props.dataInput
  } else {
    return props.dataInput
  }
})

const buttonData = componentData.value

</script>

<style lang="scss" scoped>

.socialContactSingleButton {
  &__text {
    margin-left: 10px;
  }

  &.patreon,
  &.kofi {
    align-items: center;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    box-sizing: border-box;
    cursor: pointer;
    display: inline-flex;
    font-weight: 500;
    justify-content: center;
    padding: 12.5px 24px 12.5px 24px;
    position: relative;
    text-align: center;
    transition: all 300ms cubic-bezier(0.19, 1, 0.22, 1) 0s;
    -webkit-user-select: none;
    user-select: none;
    width: unset;
    color: #fff !important;
    font-size: 16px !important;
    background-repeat: no-repeat;
    border-radius: 9999px;
  }

  &.patreon {
    background-color: #ff424d;
  }

  &.kofi {
    background-color: #000;
  }
}

</style>
