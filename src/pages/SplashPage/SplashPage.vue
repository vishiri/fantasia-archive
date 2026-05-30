<template>
  <q-page
    class="splashPage flex flex-center"
    data-test-locator="splashPage"
  >
    <div class="splashPage__inner column items-center justify-center">
      <SplashControls />

      <q-separator
        v-if="!hideWelcomeScreenSocials"
        class="splashPage__separator q-mt-xl q-mb-lg"
        color="primary-bright"
        data-test-locator="splashPage-socialSeparator"
      />

      <SocialContactButtons v-if="!hideWelcomeScreenSocials" />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import SplashControls from 'app/src/components/other/SplashControls/SplashControls.vue'
import SocialContactButtons from 'app/src/components/other/SocialContactButtons/SocialContactButtons.vue'

import { useSplashPage } from './scripts/splashPage_manager'

defineOptions({
  name: 'SplashPage'
})

const { hideWelcomeScreenSocials } = useSplashPage()
</script>

<style scoped lang="scss">
.splashPage {
  background: $splashPage-background;
  min-height: $splashPage-minHeight;
  padding: $splashPage-padding;

  &__inner {
    margin: $splashPage-inner-margin;
    width: $splashPage-inner-width;
  }

  &__separator {
    max-width: $splashPage-separator-maxWidth;
    opacity: $splashPage-separator-opacity;
    width: $splashPage-separator-width;
  }
}
</style>
