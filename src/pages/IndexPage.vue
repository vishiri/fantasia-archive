<template>
  <q-page class="row">
    <FantasiaMascotImage width="400px" />
    <div>
      <router-link to="/testeee">
        test
      </router-link>
      <textarea />
    </div>
    <div>
      <div
        v-for="n in 1000"
        :key="n"
      >
        {{ n }}
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import FantasiaMascotImage from 'src/components/FantasiaMascotImage/FantasiaMascotImage.vue'
</script>
