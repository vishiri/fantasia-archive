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
        :src="iconSrc"
        :alt="`${buttonData.label} icon`"
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
 * Data input for the component (Playwright component mode passes `dataInput` via `COMPONENT_PROPS`.)
 */
const buttonData = computed(() => props.dataInput)

/**
 * Public-folder assets (Vite `public/` / Storybook `staticDirs`) must be rooted with `BASE_URL`
 * so paths resolve in the Storybook iframe and under custom app `base` if ever set.
 */
const iconSrc = computed(() => {
  const rawBase = import.meta.env.BASE_URL
  // Quasar Electron uses an empty Vite `base` that becomes `'/'` for `import.meta.env.BASE_URL`.
  // Root-relative `/images/...` breaks under `file://` (packaged app); use a relative base instead.
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
    background-color: $socialContactButtons-backgroundColor-webpage;
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
