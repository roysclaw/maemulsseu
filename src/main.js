import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const container = document.getElementById('app')
if (container?.__vue_app__) {
  container.__vue_app__.unmount()
}
createApp(App).mount('#app')
