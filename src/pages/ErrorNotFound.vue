<template>
  <q-page
    class="errorNotFoundPage flex flex-center column text-center q-pa-md bg-dark text-primary"
    data-test-locator="errorNotFoundPage"
  >
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
  </q-page>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { i18n } from 'app/i18n/externalFileLoader'
import ErrorCard from 'src/components/elements/ErrorCard/ErrorCard.vue'

defineOptions({
  name: 'ErrorNotFound'
})

const errorCardDetails = computed(() =>
  `${i18n.global.t('errorNotFound.subTitleFirst')}\n${i18n.global.t('errorNotFound.subTitleSecond')}`
)
</script>

<style scoped lang="scss">
.errorNotFoundPage {
  min-height: inherit;
}
</style>
