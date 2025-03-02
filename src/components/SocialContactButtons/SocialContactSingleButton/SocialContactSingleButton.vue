<template>
  <q-btn
    :class="['socialContactSingleButton', buttonData.cssClass]"
    :title="buttonData.title"
    :href="buttonData.url"
    data-test="socialContactSingleButton"
    no-caps
  >
    <div class="row items-center no-wrap">
      <q-img
        spinner-size="0"
        :src="`images/socialContactButtons/${buttonData.icon}`"
        fit="contain"
        :width="`${buttonData.width}px`"
        :height="`${buttonData.height}px`"
        data-test="socialContactSingleButton-image"
      />
      <div
        class="text-no-wrap socialContactSingleButton__text"
        data-test="socialContactSingleButton-text"
      >
        {{ buttonData.label }}
      </div>
    </div>
  </q-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { testData } from './tests/_testData'

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
 * Testing component name currently being tested
 */
const testingComponent = window.faContentBridgeAPIs.extraEnvVariables.COMPONENT_NAME

/**
  * Data input for the component
  * - If testing type is "components", use test data, otherwise use prop data
  */
const componentData = computed(() => {
  if (testingType === 'components' && testingComponent === 'SocialContactSingleButton') {
    return testData
  } else {
    return props.dataInput
  }
})

const buttonData = componentData.value

</script>

<style lang="scss">

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
    background-color: $socialContactButtons-backgroundColor-patreon;

    .q-focus-helper {
      background-color: $socialContactButtons-hoverColor-patreon !important;
    }
  }

  &.kofi {
    background-color: $socialContactButtons-backgroundColor-kofi;
  }

  &.website,
  &.github {
    font-size: 15px !important;
  }

  &.website {
    border: 3px solid $socialContactButtons-hoverColor-webpage;

    .socialContactSingleButton__text {
      color: $socialContactButtons-textColor-webpage !important;
    }

    .q-focus-helper {
      background-color: $socialContactButtons-hoverColor-webpage !important;
    }

    &:focus {
      .q-focus-helper {
        opacity: 1 !important;
      }
    }
  }

  &.github {
    background-color: $socialContactButtons-backgroundColor-github;

    .socialContactSingleButton__text {
      color: $socialContactButtons-textColor-github;
    }

    .q-focus-helper {
      background-color: $socialContactButtons-hoverColor-github !important;
    }
  }

  &.discord {
    background-color: $socialContactButtons-backgroundColor-discord;

    .q-focus-helper {
      background-color: $socialContactButtons-hoverColor-discord !important;
    }
  }

  &.reddit {
    background-color: $socialContactButtons-backgroundColor-reddit;

    .q-focus-helper {
      background-color: $socialContactButtons-hoverColor-reddit !important;
    }
  }

  &.twitter {
    background-color: $socialContactButtons-backgroundColor-twitter;

    .socialContactSingleButton__text {
      color: $socialContactButtons-textColor-twitter !important;
    }
  }
}
</style>
