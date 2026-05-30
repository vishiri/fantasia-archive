import { computed } from 'vue'

import { createUseErrorCard } from './functions/createUseErrorCard'
import { errorCardScopedMaxWidthBindPx } from './functions/errorCardScopedMaxWidthBindPx'

export const useErrorCard = createUseErrorCard({
  computed,
  errorCardScopedMaxWidthBindPx
})
