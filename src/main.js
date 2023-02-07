import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Quasar } from 'quasar'
import quasarUserOptions from './quasar-user-options'
import tableResizableColumns from './directives/tableResizableColumns'
import draggableResizable from './directives/draggableResizable'
import toggleActiveState from './directives/toggleActiveState'
import clickBackDropDialog from './directives/clickBackDropDialog'
import dialogDraggableResizable from './components/DraggableResizableDialog/DraggableResizableDialog.vue'
import appUtils from './utils/app'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from 'vue-query'

const app = createApp(App)
app.use(createPinia()).use(Quasar, quasarUserOptions).use(router).use(VueQueryPlugin)
app.directive('table-resizable-columns', tableResizableColumns)
app.directive('draggable-resizable', draggableResizable)
app.directive('toggle-active-state', toggleActiveState)
app.directive('click-back-drop-dialog', clickBackDropDialog)
app.component('dialogDraggableResizable', dialogDraggableResizable)
app.config.globalProperties.$app = appUtils
app.mount('#app')
