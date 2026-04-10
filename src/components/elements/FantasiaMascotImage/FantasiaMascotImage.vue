<template>
  <!-- Outer wrapper of the image -->
  <div
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

import { fantasiaImageList, determineCurrentImage } from 'app/src/scripts/appInfo/fantasiaMascotImageManager'
import { computed } from 'vue'

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

const mascotVariantName = computed(() => props.fantasiaImage || 'random')

/**
 * Currently selected image URL for rendering
 */
const currentMascotImage = determineCurrentImage(fantasiaImageList, isRandom, props.fantasiaImage)

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
