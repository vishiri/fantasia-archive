<template>
  <!-- Outer wrapper of the social contact buttons -->
  <div
    class="socialContactButtons"
    data-test-locator="socialContactButtons"
    :data-test-button-number="buttonListLength"
  >
    <div class="row justify-center">
      <div class="row justify-center q-gutter-x-lg q-mt-lg">
        <SocialContactSingleButton :data-input="buttonList.buttonPatreon" />
        <SocialContactSingleButton :data-input="buttonList.buttonKofi" />
      </div>
    </div>

    <div class="row justify-center">
      <div class="row justify-center q-gutter-x-lg q-mt-sm">
        <SocialContactSingleButton :data-input="buttonList.buttonWebsite" />
        <SocialContactSingleButton :data-input="buttonList.buttonGitHub" />
        <SocialContactSingleButton :data-input="buttonList.buttonDiscord" />
        <SocialContactSingleButton :data-input="buttonList.buttonReddit" />
        <SocialContactSingleButton :data-input="buttonList.buttonTwitter" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { buttonList } from './_data/buttons'

import SocialContactSingleButton from 'app/src/components/elements/SocialContactSingleButton/SocialContactSingleButton.vue'

const buttonListLength = Object.keys(buttonList).length

</script>
