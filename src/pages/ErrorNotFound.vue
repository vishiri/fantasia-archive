<template>
  <div class="fullscreen bg-dark text-primary text-center q-pa-md flex column flex-center">
    <GlobalWindowButtons />
    <q-card
      class="q-pl-xl q-pr-xl q-pb-xl errorPage-card"
    >
      <q-card-section>
        <h2 class="text-negative">
          {{ $t('errorNotFound.title') }}
        </h2>
        <h6>
          {{ $t('errorNotFound.subTitleFirst') }}
          <br>
          {{ $t('errorNotFound.subTitleSecond') }}
        </h6>
        <FantasiaMascotImage
          fantasia-image="error"
          width="300px"
        />
      </q-card-section>
    </q-card>

    <div>
      <q-btn
        class="q-mt-xl"
        color="primary"
        outline
        size="xl"
        to="/"
      >
        {{ $t('errorNotFound.ctaText') }}
      </q-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import GlobalWindowButtons from 'src/components/globals/GlobalWindowButtons/GlobalWindowButtons.vue'
import FantasiaMascotImage from 'src/components/elements/FantasiaMascotImage/FantasiaMascotImage.vue'
</script>

<style lang="scss" scoped>
.errorPage-card {
  background-color: $qCard-errorPage-background;
  border: $qCard-errorPage-border-size solid $qCard-errorPage-border-color;
  border-radius: $qCard-errorPage-border-radius;
  box-shadow: none;
  color: $qCard-errorPage-text;
}
</style>
