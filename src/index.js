import Vue from 'vue';
import App from './app.vue';

import './assets/styles/globel.styl';

const root = document.createElement('div');
document.body.appendChild(root);

new Vue({
  render:(h)=>h(App)//声明了组件渲染出来的是app
}).$mount(root);//挂载到节点上
