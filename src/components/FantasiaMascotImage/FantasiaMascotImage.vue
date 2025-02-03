<template>
  <!-- Outer wrapper of the image -->
  <div
    class="fantasiaMascotImage"
  >
    <!-- Inner image of the chosen Fantasia Mascot -->
    <img
      :src="currentMascotImage"
      class="fantasiaMascotImage__inner"
      data-test="fantasiaMascotImage-image"
      :data-test-image="fantasiaImage"
      :data-test-is-random="isRandom"
    >
  </div>
</template>

<script setup lang="ts">

import { fantasiaImageList, determineCurrentImage } from 'app/src/scripts/appInfo/fantasiaMascotImageManager'

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

/**
 * Determines if the image URL will be generating randomly or if it is set via the prop.
 */
const isRandom = ((imageUrl: string) => (imageUrl === ''))(props.fantasiaImage)

/**
 * Currently selected image URL for rendering
 */
const currentMascotImage = determineCurrentImage(fantasiaImageList, isRandom, props.fantasiaImage)

</script>

<style lang="scss" scoped>

.fantasiaMascotImage {
  &__inner {
    height: v-bind(height);
    width: v-bind(width);
    user-select: none;
  }
}

</style>
