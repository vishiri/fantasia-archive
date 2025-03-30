<template>
  <q-page-sticky
    position="bottom-right"
    :offset="[18, 18]"
    style="cursor:pointer;"
  >
    <q-btn
      fab
      icon="wifi"
      :class="{'bg-purple':active && !loading,'bg-gray':!active || loading,'pulse':loading}"
      @click="onclick"
    />
  </q-page-sticky>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const active = ref(false)
const loading = ref(false)
const props = defineProps({ 'color': { type: String, default: '#9c27b0' } })
const color = props.color
const textcolor = ref('white')

async function onclick () {
  active.value = !active.value
  loading.value = true
  active.value = window.faServerControl.setState(active.value)
  loading.value = false
}

window.faServerControl.setRequestListener(function (ev, port) {
  console.log(port, ev)
  const doc = document.doctype,
    doctype = doc ? '<!DOCTYPE ' +
         doc.name +
         (doc.publicId ? ' PUBLIC "' + doc.publicId + '"' : '') +
         (!doc.publicId && doc.systemId ? ' SYSTEM' : '') +
         (doc.systemId ? ' "' + doc.systemId + '"' : '') +
         '>\n' : ''
  const html = document.documentElement
  html.querySelectorAll('script').forEach(e => e.remove())
  const connector = document.createElement('script')
  connector.src = '/connector.js'
  html.body.append(connector)
  ev.respond(doctype + html.outerHTML)
})
</script>

<style scoped lang="css">
.pulse{
  animation-name: pulse;
  color: v-bind(textcolor);
  animation-iteration-count: infinite;
  animation-duration: 4s;
  animation-timing-function: ease-in-out;
}

@keyframes pulse{
  0%, 100%{
    background-color: v-bind(color);
  filter: brightness(100%)
    }
  50%{
  filter: brightness(80.333333333333%)
    }
}
</style>
