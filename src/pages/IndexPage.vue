<template>
  <q-page class="row">
    <div>
      <router-link to="/testeee">
        test
      </router-link>
    </div>
    <div>
      <a href="https://www.google.com">
        Google same URL
      </a>
    </div>
    <div>
      <a
        href="https://www.google.com"
        target="_blank"
      >
        Google same URL target="_blank"
      </a>
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
