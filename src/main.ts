import { createApp } from "vue";
import Generator from "./components/Generator.vue";

import 'vuetify/styles'
import '@fortawesome/fontawesome-free/css/all.min.css'

import {createVuetify} from "vuetify"

import { aliases, fa } from 'vuetify/iconsets/fa'

import { VTreeview } from 'vuetify/labs/VTreeview'

import 'highlight.js/styles/atom-one-dark.min.css'
import 'highlight.js/lib/common';
import hljsVuePlugin from "@highlightjs/vue-plugin";

const vuetify = createVuetify({
    icons: {
        defaultSet: 'fa',
        aliases,
        sets: {
            fa,
        },
    },
    components: {
        VTreeview
    },
    theme: {
        defaultTheme: 'light'
    }
})

const app = createApp(Generator);
app.use(vuetify)
app.use(hljsVuePlugin)

const container = document.querySelector('#mod-generator-app')!
if (container) {
    app.mount(container)
} else {
    const shadowContainer = document.querySelector('#mod-generator-app-shadow-root')!
    const shadow = shadowContainer.attachShadow({ mode: 'open' })
    const mountPoint = document.createElement('div')

    const templates = shadowContainer.querySelectorAll('template')
    templates.forEach(element => shadow.appendChild(element.content.cloneNode(true)))

    app.mount(mountPoint)
    shadow.appendChild(mountPoint)

    const styleSheet = document.querySelector('#vuetify-theme-stylesheet')
    if (styleSheet) {
        styleSheet.parentElement?.removeChild(styleSheet)
        // Move vuetify's runtime-generated style sheet to our shadow DOM component
        shadow.appendChild(styleSheet.cloneNode(true))
    }
}