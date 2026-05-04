<template>
  <div class="splashControls column items-center">
    <div class="splashControls__header column items-center">
      <h5 class="splashControls__welcome q-ma-none">
        {{ $t('splashPage.welcomeLine') }}
      </h5>

      <div
        class="splashControls__titleRow row items-center no-wrap q-mt-sm"
        data-test-locator="splashPage-titleRow"
      >
        <img
          alt=""
          class="splashControls__wing splashControls__wing--left"
          data-test-locator="splashPage-wing-left"
          :src="splashTitleWingSrc"
          width="90"
          height="100"
          decoding="async"
          fetchpriority="high"
          loading="eager"
        >
        <h2
          class="splashControls__title text-weight-medium text-primary-bright q-ma-none q-px-md"
          data-test-locator="splashPage-title"
        >
          {{ $t('splashPage.title') }}
        </h2>
        <img
          alt=""
          class="splashControls__wing splashControls__wing--right"
          data-test-locator="splashPage-wing-right"
          :src="splashTitleWingSrc"
          width="90"
          height="100"
          decoding="async"
          fetchpriority="high"
          loading="eager"
        >
      </div>
    </div>

    <div
      class="splashControls__actions column items-center q-gutter-lg q-mt-lg"
      data-test-locator="splashPage-primaryActions"
    >
      <q-btn
        class="splashControls__actionBtn text-uppercase"
        color="primary-bright"
        data-test-locator="splashPage-btn-resume"
        outline
        type="button"
        :label="$t('splashPage.resumeProject')"
      />
      <q-btn
        class="splashControls__actionBtn text-uppercase"
        color="primary-bright"
        data-test-locator="splashPage-btn-new"
        outline
        type="button"
        :label="$t('splashPage.newProject')"
      />
      <q-btn
        class="splashControls__actionBtn text-uppercase"
        color="primary-bright"
        data-test-locator="splashPage-btn-load"
        outline
        type="button"
        :label="$t('splashPage.loadExistingProject')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { resolveVitePublicAssetPath } from 'app/src/scripts/appInternals/rendererAppInternals'

defineOptions({
  name: 'SplashControls'
})

/**
 * Same wing raster as public/icons/favicon-512x512.png, copied under public/images/splash/ for preload and a dedicated splash URL.
 */
const splashTitleWingSrc = resolveVitePublicAssetPath('images/splash/splash_logo.png')
</script>

<style scoped lang="scss">
.splashControls {
  &__header {
    max-width: $splashControls-header-maxWidth;
  }

  &__welcome {
    opacity: $splashControls-welcome-opacity;
  }

  &__titleRow {
    max-width: $splashControls-titleRow-maxWidth;
  }

  &__title {
    text-align: center;
  }

  &__wing {
    display: block;
    flex-shrink: 0;
    height: $splashControls-wing-height;
    margin-top: $splashControls-wing-marginTop;
    width: $splashControls-wing-width;

    &--right {
      transform: scaleX(-1);
    }
  }

  &__actions {
    max-width: $splashControls-actions-maxWidth;
  }

  &__actionBtn {
    font-size: $splashControls-actionBtn-fontSize;
    padding: $splashControls-actionBtn-padding;
    width: fit-content;
  }
}
</style>
