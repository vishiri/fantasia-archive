<template>
  <!-- Outer wrapper of the social contact buttons -->
  <div class="socialContactButtons">
    <div class="row justify-center">
      <div class="q-gutter-x-lg">
        <SocialContactSingleButton :data-input="buttonList.buttonPatreon" />
        <SocialContactSingleButton :data-input="buttonList.buttonKofi" />
      </div>
    </div>

    <div class="row justify-center">
      <div class="q-gutter-lg">
        <SocialContactSingleButton :data-input="buttonList.buttonWebsite" />
        <SocialContactSingleButton :data-input="buttonList.buttonGitHub" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { buttonList } from './_data/buttons'

import SocialContactSingleButton from 'app/src/components/SocialContactButtons/SocialContactSingleButton/SocialContactSingleButton.vue'

</script>

<style lang="scss" scoped>

.socialContactButtons {

}

</style>
