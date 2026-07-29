<template>
  <span
    v-if="visible"
    aria-hidden="true"
    class="faCornerContentDot"
    :data-test-locator="locator"
  />
</template>

<script setup lang="ts">
defineOptions({
  name: 'FaCornerContentDot'
})

defineProps<{
  locator: string
  visible: boolean
}>()
</script>

<style lang="scss" src="./styles/FaCornerContentDot.unscoped.scss"></style>
