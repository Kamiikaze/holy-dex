import { createApp } from 'vue'
import vuetify from './plugins/vuetify'
import App from './App.vue'

import 'vuetify/styles'
import './styles/global.css'

createApp(App).use(vuetify).mount('#app')
