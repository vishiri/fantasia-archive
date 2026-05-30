import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { i18n } from 'app/i18n/externalFileLoader'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

import { createUseProjectOverview } from '../functions/createUseProjectOverview'
import { pickProjectOverviewRandomTipCaption } from './projectOverviewPickRandomTipWiring'

export const useProjectOverview = createUseProjectOverview({
  S_FaActiveProject,
  S_FaUserSettings,
  computed,
  onMounted,
  pickRandomTipCaption: pickProjectOverviewRandomTipCaption,
  ref,
  storeToRefs,
  t: (key) => i18n.global.t(key)
})
