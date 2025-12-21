/**
 * Application Entry Point
 */

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { initAuth } from './stores/auth';
import './style.css';

// Initialize auth state from localStorage
initAuth();

// Create and mount the app
const app = createApp(App);
app.use(router);
app.mount('#app');
