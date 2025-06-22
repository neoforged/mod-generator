import { createApp } from "vue";
import PrimeVue from 'primevue/config';
import Generator from "./components/Generator.vue";
import Aura from '@primeuix/themes/aura'
import {Button, FloatLabel, InputText, Message, Select, Toast, ToastService} from "primevue";
import {Form} from "@primevue/forms";

const app = createApp(Generator);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
})
    .use(ToastService)
    .component('Button', Button)
    .component('InputText', InputText)
    .component('FloatLabel', FloatLabel)
    .component('Message', Message)
    .component('Form', Form)
    .component('Select', Select)
    .component('Toast', Toast)
app.mount("#mod-generator-app");
