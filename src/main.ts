import { createApp } from "vue";
import Generator from "./components/Generator.vue";

import 'vuetify/lib/styles/main.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

import {createVuetify} from "vuetify"

import { aliases, fa } from 'vuetify/iconsets/fa'

const vuetify = createVuetify({
    icons: {
        defaultSet: 'fa',
        aliases,
        sets: {
            fa,
        },
    }
})

const app = createApp(Generator);
app.use(vuetify)
app.mount("#mod-generator-app");
