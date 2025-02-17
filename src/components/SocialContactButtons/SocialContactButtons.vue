<template>
  <!-- Outer wrapper of the social contact buttons -->
  <div class="socialContactButtons">
    <q-btn>
      <div class="row items-center no-wrap">
        <q-img
          src="images/fantasiaMascot/fantasia_error.png"
          fit="contain"
          width="100px"
        />
        <div class="text-no-wrap">
          {{ $t('SocialContactButtons.buttonPatreon.title') }}
        </div>
      </div>
    </q-btn>
  </div>
</template>

<script setup lang="ts">

</script>

<style lang="scss" scoped>

.socialContactButtons {
}

</style>
