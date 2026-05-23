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
import { computed } from 'vue'

import { i18n } from 'app/i18n/externalFileLoader'

import { buildSocialContactButtonList } from './scripts/buildSocialContactButtonList'

import SocialContactSingleButton from 'app/src/components/elements/SocialContactSingleButton/SocialContactSingleButton.vue'

const buttonList = computed(() => {
  void i18n.global.locale.value
  return buildSocialContactButtonList((messageKey) => i18n.global.t(messageKey))
})

const buttonListLength = computed(() => Object.keys(buttonList.value).length)

</script>
