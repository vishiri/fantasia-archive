<template>
  <!--
    Renders nothing visible. Owns 'style#faProjectUserCss' after 'style#faUserCss' while SQLite-backed
    Pinia mirrors project-scoped CSS for the active '.faproject'.
  -->
  <span
    aria-hidden="true"
    class="faProjectUserCssInjectorHost"
    data-fa-project-user-css-host="true"
    hidden
  />
</template>

<script setup lang="ts">
import { useFaProjectUserCssInjector } from './scripts/faProjectUserCssInjector_manager'

defineOptions({
  name: '_FaProjectUserCssInjector'
})

useFaProjectUserCssInjector()
</script>
