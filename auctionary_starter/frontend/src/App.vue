<script setup>
/**
 * App.vue - Root Application Component
 * Provides the main layout structure with navigation and router view
 */

import NavBar from '@/components/NavBar.vue';
</script>

<template>
    <div class="app">
        <NavBar />
        
        <main class="main-content">
            <router-view v-slot="{ Component }">
                <transition name="page" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </main>
        
        <footer class="app-footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-brand">
                        <svg viewBox="0 0 32 32" fill="none" class="footer-logo">
                            <polygon points="16,4 28,10 28,22 16,28 4,22 4,10" 
                                     fill="none" stroke="currentColor" stroke-width="2"/>
                            <circle cx="16" cy="16" r="4" fill="currentColor"/>
                        </svg>
                        <span>Elemental Exchange</span>
                    </div>
                    <p class="footer-tagline">
                        Buy elements. React responsibly.
                    </p>
                    <p class="footer-copy">
                        &copy; {{ new Date().getFullYear() }} Elemental Exchange. 
                        Built for Full Stack Web Development coursework.
                    </p>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.main-content {
    flex: 1;
}

/* Page transition animations */
.page-enter-active,
.page-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from {
    opacity: 0;
    transform: translateY(10px);
}

.page-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

/* Footer styles */
.app-footer {
    background: var(--color-navy);
    color: var(--color-white);
    padding: var(--space-2xl) 0;
    margin-top: auto;
}

.footer-content {
    text-align: center;
}

.footer-brand {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    font-family: var(--font-heading);
    font-weight: 600;
    font-size: 1.125rem;
    margin-bottom: var(--space-md);
}

.footer-logo {
    width: 24px;
    height: 24px;
    color: var(--color-teal-light);
}

.footer-tagline {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: var(--space-md);
    font-size: 0.9375rem;
}

.footer-copy {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.8125rem;
    margin: 0;
}
</style>
