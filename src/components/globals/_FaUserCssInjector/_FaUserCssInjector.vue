<template>
  <!--
    Renders an empty hidden span as a Vue template root. Owns a single 'style#faUserCss' element appended to
    'document.head' so user CSS applies across every route, layout, and embedded surface. Mounted at App.vue level
    (parent of <router-view />) so it survives MainLayout / ComponentTestingLayout / 404 transitions.
  -->
  <span
    aria-hidden="true"
    class="faUserCssInjectorHost"
    data-fa-user-css-host="true"
    hidden
  />
</template>

<script setup lang="ts">
import { useFaUserCssInjector } from './scripts/faUserCssInjector_manager'

defineOptions({
  name: '_FaUserCssInjector'
})

useFaUserCssInjector()
</script>
