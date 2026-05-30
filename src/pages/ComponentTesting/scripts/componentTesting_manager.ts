import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { createComponentTesting } from './functions/createComponentTesting'
import {
  readComponentTestingPropsFromSnapshot,
  resolveComponentTestingSfcByName
} from './functions/componentTestingHarness'

const componentTestingApi = createComponentTesting({
  computed,
  onMounted,
  readComponentTestingPropsFromSnapshot,
  ref,
  resolveComponentTestingSfcByName,
  useRoute
})

export const useComponentTesting = componentTestingApi.useComponentTesting
