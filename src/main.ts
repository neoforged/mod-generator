import { createApp } from "vue";
import Generator from "./components/Generator.vue";

import 'vuetify/lib/styles/main.css'
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
    }
})

const app = createApp(Generator);
app.use(vuetify)
app.use(hljsVuePlugin)

const container = document.querySelector('#mod-generator-app')!
if (container.attributes.getNamedItem('shadow-attach')) {
    const shadow = container.attachShadow({ mode: 'open' })
    const mountPoint = document.createElement('div')

    const templates = container.querySelectorAll('template')
    templates.forEach(element => shadow.appendChild(element.cloneNode(true)))

    app.mount(mountPoint)
    shadow.appendChild(mountPoint)
} else {
    app.mount(container)
}
