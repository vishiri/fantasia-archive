import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite'

import { S_FaProgramStyling } from 'app/src/stores/S_FaProgramStyling'

import FaUserCssInjector from '../FaUserCssInjector.vue'

const seedCustomCss: Decorator = (story) => {
  const store = S_FaProgramStyling()
  store.css = '.fa-storybook-user-css-probe { text-decoration: underline; }'
  return {
    components: { story },
    template: `
      <div class="fa-storybook-faUserCssInjector-stage q-pa-sm" style="box-sizing: border-box; min-height: 80px;">
        <p class="fa-storybook-user-css-probe text-caption q-mb-sm">User CSS scope probe (underline from the injected #faUserCss style)</p>
        <story />
      </div>
    `
  }
}

const meta = {
  title: 'Components/globals/FaUserCssInjector',
  component: FaUserCssInjector,
  decorators: [seedCustomCss],
  parameters: {
    docs: {
      disable: true
    }
  }
} satisfies Meta<typeof FaUserCssInjector>

export default meta

export const Default: StoryObj<typeof meta> = {}
