<template>
  <q-card
    class="errorCard q-pl-xl q-pr-xl q-pb-xl q-pt-md"
    data-test-locator="errorCard"
    :data-test-error-card-width="String(props.width)"
  >
    <q-card-section class="text-center">
      <h2 class="errorCard__title text-negative q-my-none text-h5 text-weight-medium">
        {{ title }}
      </h2>
      <FantasiaMascotImage
        class="q-mt-md"
        :fantasia-image="imageName"
        width="300px"
      />
      <p
        v-if="details"
        class="errorCard__details text-body1 q-mt-md q-mb-none"
      >
        {{ details }}
      </p>
    </q-card-section>
  </q-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import FantasiaMascotImage from 'src/components/elements/FantasiaMascotImage/FantasiaMascotImage.vue'

import type { T_errorCardImageName } from './ErrorCard.types'

const props = withDefaults(
  defineProps<{
    /**
     * Primary message shown above the mascot image.
     */
    title: string
    /**
     * Optional supporting copy rendered below the mascot; use newlines for multi-line text.
     */
    details?: string
    /**
     * Mascot variant key from fantasiaMascotImageManager.
     */
    imageName: T_errorCardImageName
    /**
     * Maximum width of the card in CSS pixels (card still shrinks with `max-width: min(100%, …)`).
     */
    width?: number
  }>(),
  {
    details: undefined,
    width: 600
  }
)

const errorCardMaxWidthPx = computed(() => `${props.width}px`)
</script>

<style lang="scss" scoped>
.errorCard {
  background-color: $errorCard-background;
  border: $errorCard-border-size solid $errorCard-border-color;
  border-radius: $errorCard-border-radius;
  box-shadow: none;
  box-sizing: border-box;
  color: $errorCard-text;
  max-width: min(100%, v-bind(errorCardMaxWidthPx));
  width: 100%;
}

.errorCard__details {
  white-space: pre-line;
}
</style>
