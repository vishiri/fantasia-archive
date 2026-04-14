<template>
  <q-card
    class="errorCard q-pl-xl q-pr-xl q-pb-xl q-pt-md"
    data-test-locator="errorCard"
    :data-test-error-card-width="String(props.width)"
  >
    <q-card-section class="text-center">
      <p
        class="errorCard__title text-negative q-my-none text-h5 text-weight-medium"
        data-test-locator="errorCard-title"
      >
        {{ title }}
      </p>
      <p
        v-if="description"
        class="errorCard__description text-negative q-mt-md q-mb-none text-body1"
        data-test-locator="errorCard-description"
      >
        {{ description }}
      </p>
      <FantasiaMascotImage
        class="q-mt-lg"
        :fantasia-image="imageName"
        width="300px"
      />
      <p
        v-if="details"
        class="errorCard__details text-h6 q-mt-lg q-mb-none text-negative"
      >
        {{ details }}
      </p>
    </q-card-section>
  </q-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import FantasiaMascotImage from 'src/components/elements/FantasiaMascotImage/FantasiaMascotImage.vue'

import type { T_errorCardImageName } from 'app/types/T_errorCardImage'

const props = withDefaults(
  defineProps<{
    /**
     * Primary heading shown above the mascot (and above optional description when set).
     */
    title: string
    /**
     * Optional copy between the title and the mascot; omit when the title alone is enough.
     */
    description?: string
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
    description: undefined,
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

.errorCard__description {
  white-space: pre-line;
}

.errorCard__details {
  white-space: pre-line;
}
</style>
