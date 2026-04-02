<template>
  <div class="fullscreen bg-dark text-primary text-center q-pa-md flex column flex-center">
    <GlobalWindowButtons />
    <q-card
      class="q-pl-xl q-pr-xl q-pb-xl errorPage-card"
    >
      <q-card-section>
        <h2 class="text-negative">
          {{ $t('ErrorNotFound.title') }}
        </h2>
        <h6>
          {{ $t('ErrorNotFound.subTitleFirst') }}
          <br>
          {{ $t('ErrorNotFound.subTitleSecond') }}
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
        {{ $t('ErrorNotFound.ctaText') }}
      </q-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import GlobalWindowButtons from 'src/components/GlobalWindowButtons/GlobalWindowButtons.vue'
import FantasiaMascotImage from 'src/components/FantasiaMascotImage/FantasiaMascotImage.vue'
</script>

<style lang="scss" scoped>
.errorPage-card {
  border-radius: $qCard-errorPage-border-radius;
  box-shadow: none;
  border: $qCard-errorPage-border-size solid $qCard-errorPage-border-color;
  background-color: $qCard-errorPage-background;
  color: $qCard-errorPage-text;
}
</style>
