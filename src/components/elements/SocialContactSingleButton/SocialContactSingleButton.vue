<template>
  <q-btn
    :class="['socialContactSingleButton', buttonData.cssClass]"
    :title="buttonData.title"
    :href="buttonData.url"
    data-test-locator="socialContactSingleButton"
    no-caps
  >
    <div class="row items-center no-wrap">
      <q-img
        spinner-size="0"
        :src="iconSrc"
        :alt="`${buttonData.label} icon`"
        fit="contain"
        :width="`${buttonData.width}px`"
        :height="`${buttonData.height}px`"
        data-test-locator="socialContactSingleButton-image"
        :data-test-layout-height="String(buttonData.height)"
        :data-test-layout-width="String(buttonData.width)"
      />
      <div
        class="text-no-wrap socialContactSingleButton__text"
        data-test-locator="socialContactSingleButton-text"
      >
        {{ buttonData.label }}
      </div>
    </div>
  </q-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { I_socialContactButton } from 'app/types/I_socialContactButtons'

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
 * Data input for the component (Playwright component mode passes 'dataInput' via 'COMPONENT_PROPS'.)
 */
const buttonData = computed(() => props.dataInput)

/**
 * Public-folder assets (Vite public/ and Storybook staticDirs) must be rooted with BASE_URL so paths resolve in the Storybook iframe and when the app base path is customized.
 */
const iconSrc = computed(() => {
  const rawBase = import.meta.env.BASE_URL
  // Quasar Electron maps an empty Vite base to '/' on import.meta.env.BASE_URL; root-relative /images/... fails under file:// in packaged builds, so normalize to a relative base.
  const base =
    rawBase === '' || rawBase === undefined || rawBase === '/'
      ? './'
      : rawBase
  const baseWithSlash = base.endsWith('/') ? base : `${base}/`

  return `${baseWithSlash}images/socialContactButtons/${props.dataInput.icon}`
})

</script>

<style lang="scss">
.socialContactSingleButton {
  &__text {
    margin-left: $socialContactSingleButton-text-marginLeft;
  }

  &.patreon,
  &.kofi {
    align-items: center;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    background-repeat: no-repeat;
    border-radius: $socialContactSingleButton-chip-borderRadius;
    box-sizing: border-box;
    color: $socialContactSingleButton-chip-color !important;
    cursor: pointer;
    display: inline-flex;
    font-size: $socialContactSingleButton-chip-fontSize !important;
    font-weight: $socialContactSingleButton-chip-fontWeight;
    justify-content: center;
    padding: $socialContactSingleButton-chip-padding;
    position: relative;
    text-align: center;
    transition: $socialContactSingleButton-chip-transition;
    -webkit-user-select: none;
    user-select: none;
    width: unset;
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
    font-size: $socialContactSingleButton-variant-fontSize-compact !important;
  }

  &.website {
    background-color: $socialContactButtons-backgroundColor-webpage;
    border: $socialContactSingleButton-website-borderWidth solid $socialContactButtons-hoverColor-webpage;

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
