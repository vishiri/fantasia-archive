import axios from 'axios'

import 'app/types/vueAxiosModuleAugmentation'

import { createRunAxiosBoot } from './axiosBootApi'

const axiosBoot = createRunAxiosBoot({
  axios,
  createApi: () => axios.create({ baseURL: 'https://api.example.com' })
})

export const api = axiosBoot.api

export const runAxiosBoot = axiosBoot.runAxiosBoot
