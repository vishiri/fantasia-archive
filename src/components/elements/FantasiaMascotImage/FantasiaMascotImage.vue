<template>
  <!-- Outer wrapper of the image; omitted when App Settings hidePlushes is on. -->
  <div
    v-if="showMascot"
    class="fantasiaMascotImage"
  >
    <!-- Native img avoids q-img wrapper/async sizing that caused layout shift in tests. -->
    <img
      :alt="`${$t('fantasiaMascotImage.label')} - ${mascotVariantName}`"
      class="fantasiaMascotImage__inner"
      data-test-locator="fantasiaMascotImage-image"
      :data-test-image="fantasiaImage"
      :data-test-is-random="isRandom"
      :data-test-layout-height="height"
      :data-test-layout-width="width"
      :height="height"
      :src="currentMascotImage"
      :width="width"
    >
  </div>
</template>

<script setup lang="ts">
import { useFantasiaMascotImage } from './scripts/fantasiaMascotImage_manager'

/**
 * All component props
 */
const props = defineProps({
  /**
    * Name of the object key from the list to render. Leave empty in order to generate random image.
    * @see fantasiaImageList
    */
  fantasiaImage: {
    type: String,
    default: ''
  },

  /**
   * Custom CSS string for the "height" attribute.
   */
  height: {
    type: String,
    default: 'initial'
  },

  /**
   * Custom CSS string for the "width" attribute.
   */
  width: {
    type: String,
    default: 'initial'
  }
})

const {
  currentMascotImage,
  fantasiaImage,
  height,
  isRandom,
  mascotVariantName,
  showMascot,
  width
} = useFantasiaMascotImage(props)

</script>

<style lang="scss" scoped>
.fantasiaMascotImage {
  &__inner {
    display: block;
    height: v-bind(height);
    margin: auto;
    max-width: 100%;
    object-fit: contain;
    user-select: none;
    width: v-bind(width);
  }
}

</style>
