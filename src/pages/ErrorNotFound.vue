<template>
  <div class="fullscreen bg-dark text-primary text-center q-pa-md flex column flex-center">
    <GlobalWindowButtons />
    <ErrorCard
      :title="$t('errorNotFound.title')"
      :details="errorCardDetails"
      image-name="error"
    />

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
import { computed } from 'vue'

import { i18n } from 'app/i18n/externalFileLoader'
import ErrorCard from 'src/components/elements/ErrorCard/ErrorCard.vue'
import GlobalWindowButtons from 'src/components/globals/GlobalWindowButtons/GlobalWindowButtons.vue'

const errorCardDetails = computed(() =>
  `${i18n.global.t('errorNotFound.subTitleFirst')}\n${i18n.global.t('errorNotFound.subTitleSecond')}`
)
</script>
