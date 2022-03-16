import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { Setting } from '@element-plus/icons-vue';
import { io } from "socket.io-client";
import CONFIG from './config';

type env = 'development' | 'production';

const ENV = process.env.NODE_ENV as env || 'development';

const socket = io(CONFIG[ENV].socket, { path: '/chat' });


// 5. 创建并挂载根实例
const app = createApp(App);

//确保 _use_ 路由实例使
//整个应用支持路由。
app.use(router);
app.use(ElementPlus);

app
  .component('setting', Setting);

app.config.globalProperties.$socket = socket;

app.mount('#app');
