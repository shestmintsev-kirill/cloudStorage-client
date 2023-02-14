import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Quasar } from 'quasar'
import quasarUserOptions from './plugins/quasar-user-options'
import draggableResizable from './directives/draggableResizable'
import dialogDraggableResizable from './components/DraggableResizableDialog/DraggableResizableDialog.vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from 'vue-query'

const app = createApp(App)
app.use(createPinia()).use(Quasar, quasarUserOptions).use(router).use(VueQueryPlugin)
app.directive('draggable-resizable', draggableResizable)
app.component('dialogDraggableResizable', dialogDraggableResizable)
app.mount('#app')
