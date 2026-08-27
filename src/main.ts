import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Swal from 'sweetalert2'

import { createPinia } from 'pinia'

window.Swal = Swal

const app = createApp(App)
const pinia = createPinia()

app.config.globalProperties.$api = window.api

app.use(pinia)
app.use(router)
app.mount('#app')
