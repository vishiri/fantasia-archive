<template>
  <q-page class="row">
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
</script>
