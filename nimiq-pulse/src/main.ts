import '@fontsource-variable/mulish'
import '@fontsource/fira-mono/400.css'
import './styles/tokens.css'
import './styles/base.css'

import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { hostLanguage } from './provider'

/**
 * Bootstrap order matters: tokens before first paint, host language read early,
 * and NOTHING wallet-related here. init() runs only when the user taps Connect.
 */
document.documentElement.lang = hostLanguage()

createApp(App).use(router).mount('#app')
