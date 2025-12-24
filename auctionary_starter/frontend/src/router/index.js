/**
 * Vue Router Configuration
 * Defines all application routes and navigation guards
 */

import { createRouter, createWebHistory } from 'vue-router';
import { isLoggedIn } from '@/stores/auth';

// Lazy load views for better performance
const HomeView = () => import('@/views/HomeView.vue');
const LoginView = () => import('@/views/LoginView.vue');
const RegisterView = () => import('@/views/RegisterView.vue');
const ProfileView = () => import('@/views/ProfileView.vue');
const ItemView = () => import('@/views/ItemView.vue');
const CreateItemView = () => import('@/views/CreateItemView.vue');
const SearchView = () => import('@/views/SearchView.vue');
const DraftsView = () => import('@/views/DraftsView.vue');

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView,
        meta: { title: 'Home' }
    },
    {
        path: '/login',
        name: 'login',
        component: LoginView,
        meta: { title: 'Login', guestOnly: true }
    },
    {
        path: '/register',
        name: 'register',
        component: RegisterView,
        meta: { title: 'Register', guestOnly: true }
    },
    {
        path: '/profile/:id?',
        name: 'profile',
        component: ProfileView,
        meta: { title: 'Profile' }
    },
    {
        path: '/item/:id',
        name: 'item',
        component: ItemView,
        meta: { title: 'Auction Details' }
    },
    {
        path: '/create',
        name: 'create',
        component: CreateItemView,
        meta: { title: 'Create Auction', requiresAuth: true }
    },
    {
        path: '/search',
        name: 'search',
        component: SearchView,
        meta: { title: 'Search Auctions' }
    },
    {
        path: '/drafts',
        name: 'drafts',
        component: DraftsView,
        meta: { title: 'My Drafts', requiresAuth: true }
    },
    // Catch-all redirect to home
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }
        return { top: 0 };
    }
});

// Navigation guards
router.beforeEach((to, from, next) => {
    // Update document title
    document.title = to.meta.title 
        ? `${to.meta.title} | Elemental Exchange` 
        : 'Elemental Exchange';
    
    // Check authentication requirements
    if (to.meta.requiresAuth && !isLoggedIn.value) {
        // Redirect to login with return URL
        next({ 
            name: 'login', 
            query: { redirect: to.fullPath } 
        });
        return;
    }
    
    // Redirect logged-in users away from guest-only pages
    if (to.meta.guestOnly && isLoggedIn.value) {
        next({ name: 'home' });
        return;
    }
    
    next();
});

export default router;
