import Vue from 'vue'
import App from './App.vue'
import 'vxe-table/lib/style.css'
import '@/assets/css/index.scss'

import { Tree, Checkbox, Button } from 'element-ui'
import 'xe-utils'
import {
  VXETable,
  Icon,
  Footer,
  Column,
  Table,
  Edit,
  Input,
  Grid,
  Tooltip,
  Menu
} from 'vxe-table'
Vue.config.productionTip = false

Vue.use(Tree).use(Checkbox).use(Button)
Vue.use(VXETable)
  .use(Icon)
  .use(Edit)
  .use(Footer)
  .use(Column)
  .use(Input)
  .use(Grid)
  .use(Tooltip)
  .use(Menu)
  .use(Table)

new Vue({
  render: h => h(App)
}).$mount('#app')
