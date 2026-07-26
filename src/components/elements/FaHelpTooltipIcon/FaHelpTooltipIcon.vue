<template>
  <span
    class="faHelpTooltipIcon"
    role="img"
  >
    <q-icon
      class="faHelpTooltipIcon__circle"
      name="mdi-help-circle"
      aria-hidden="true"
    />
    <span
      class="faHelpTooltipIcon__diamond"
      aria-hidden="true"
    >
      <q-icon
        class="faHelpTooltipIcon__glyph"
        name="fa-solid fa-question"
      />
    </span>
    <slot />
  </span>
</template>

<script setup lang="ts">
defineOptions({
  name: 'FaHelpTooltipIcon'
})
</script>

<style lang="scss" scoped src="./styles/FaHelpTooltipIcon.scoped.scss"></style>
<style lang="scss" src="./styles/FaHelpTooltipIcon.unscoped.scss"></style>
