<script setup>
/**
 * NavBar Component
 * Main navigation with auth-aware menu items
 */

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/stores/auth';

const router = useRouter();
const { isLoggedIn, currentUserId, logout } = useAuth();

const mobileMenuOpen = ref(false);
const loggingOut = ref(false);

async function handleLogout() {
    loggingOut.value = true;
    try {
        await logout();
        router.push({ name: 'home' });
    } finally {
        loggingOut.value = false;
        mobileMenuOpen.value = false;
    }
}

function closeMobileMenu() {
    mobileMenuOpen.value = false;
}
</script>

<template>
    <nav class="navbar">
        <div class="navbar-container container">
            <!-- Logo -->
            <router-link to="/" class="navbar-brand" @click="closeMobileMenu">
                <div class="brand-icon">
                    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <!-- Decorative orbit rings with gradients -->
                        <circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="0.5" opacity="0.15"/>
                        <circle cx="16" cy="16" r="11.5" stroke="currentColor" stroke-width="1.5" opacity="0.2" stroke-dasharray="2 3"/>
                        <circle cx="16" cy="16" r="6.5" stroke="currentColor" stroke-width="1.5" opacity="0.2" stroke-dasharray="2 3"/>

                        <!-- Nucleus with gradient effect -->
                        <circle cx="16" cy="16" r="4.5" fill="currentColor"/>
                        <circle cx="16" cy="16" r="3.2" fill="#14b8a6" opacity="0.6"/>
                        <circle cx="16" cy="16" r="1.8" fill="#5eead4" opacity="0.8"/>

                        <!-- Electrons on outer orbit with glow -->
                        <circle cx="16" cy="4" r="2.2" fill="#f59e0b" opacity="0.3"/>
                        <circle cx="16" cy="4" r="1.5" fill="#f59e0b"/>

                        <circle cx="27.5" cy="16" r="2.2" fill="#f59e0b" opacity="0.3"/>
                        <circle cx="27.5" cy="16" r="1.5" fill="#f59e0b"/>

                        <circle cx="16" cy="28" r="2.2" fill="#fbbf24" opacity="0.3"/>
                        <circle cx="16" cy="28" r="1.5" fill="#fbbf24"/>

                        <circle cx="4.5" cy="16" r="2.2" fill="#fbbf24" opacity="0.3"/>
                        <circle cx="4.5" cy="16" r="1.5" fill="#fbbf24"/>

                        <!-- Electrons on inner orbit with glow -->
                        <circle cx="16" cy="9.5" r="2" fill="#fcd34d" opacity="0.3"/>
                        <circle cx="16" cy="9.5" r="1.3" fill="#fcd34d"/>

                        <circle cx="16" cy="22.5" r="2" fill="#fcd34d" opacity="0.3"/>
                        <circle cx="16" cy="22.5" r="1.3" fill="#fcd34d"/>
                    </svg>
                </div>
                <span class="brand-text">Molecule Market</span>
            </router-link>
            
            <!-- Desktop Navigation -->
            <div class="navbar-links">
                <router-link to="/search" class="nav-link">Browse</router-link>
                
                <template v-if="isLoggedIn">
                    <router-link to="/create" class="nav-link">Sell</router-link>
                    <router-link to="/drafts" class="nav-link">Drafts</router-link>
                    <router-link :to="`/profile/${currentUserId}`" class="nav-link">Profile</router-link>
                    <button 
                        @click="handleLogout" 
                        class="btn btn-ghost nav-btn"
                        :disabled="loggingOut"
                    >
                        {{ loggingOut ? 'Logging out...' : 'Logout' }}
                    </button>
                </template>
                
                <template v-else>
                    <router-link to="/login" class="btn btn-outline nav-btn">Login</router-link>
                    <router-link to="/register" class="btn btn-primary nav-btn">Register</router-link>
                </template>
            </div>
            
            <!-- Mobile Menu Button -->
            <button 
                class="mobile-menu-btn"
                @click="mobileMenuOpen = !mobileMenuOpen"
                :aria-expanded="mobileMenuOpen"
                aria-label="Toggle menu"
            >
                <span class="hamburger" :class="{ open: mobileMenuOpen }">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </button>
        </div>
        
        <!-- Mobile Menu -->
        <div class="mobile-menu" :class="{ open: mobileMenuOpen }">
            <router-link to="/search" class="mobile-link" @click="closeMobileMenu">
                Browse Auctions
            </router-link>
            
            <template v-if="isLoggedIn">
                <router-link to="/create" class="mobile-link" @click="closeMobileMenu">
                    Create Auction
                </router-link>
                <router-link to="/drafts" class="mobile-link" @click="closeMobileMenu">
                    My Drafts
                </router-link>
                <router-link :to="`/profile/${currentUserId}`" class="mobile-link" @click="closeMobileMenu">
                    My Profile
                </router-link>
                <button @click="handleLogout" class="mobile-link logout-btn" :disabled="loggingOut">
                    {{ loggingOut ? 'Logging out...' : 'Logout' }}
                </button>
            </template>
            
            <template v-else>
                <router-link to="/login" class="mobile-link" @click="closeMobileMenu">
                    Login
                </router-link>
                <router-link to="/register" class="mobile-link highlight" @click="closeMobileMenu">
                    Register
                </router-link>
            </template>
        </div>
    </nav>
</template>

<style scoped>
.navbar {
    background: var(--color-white);
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    z-index: 100;
}

.navbar-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
}

.navbar-brand {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    color: var(--color-teal);
    text-decoration: none;
    font-family: var(--font-heading);
    font-weight: 600;
    font-size: 1.125rem;
}

.navbar-brand:hover {
    color: var(--color-teal-dark);
}

.brand-icon {
    width: 32px;
    height: 32px;
}

.brand-icon svg {
    width: 100%;
    height: 100%;
}

.navbar-links {
    display: flex;
    align-items: center;
    gap: var(--space-md);
}

.nav-link {
    font-family: var(--font-heading);
    font-weight: 500;
    font-size: 0.9375rem;
    color: var(--color-slate);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
}

.nav-link:hover {
    color: var(--color-teal);
    background: var(--color-bg-alt);
}

.nav-link.router-link-active {
    color: var(--color-teal);
}

.nav-btn {
    margin-left: var(--space-sm);
}

/* Mobile Menu Button */
.mobile-menu-btn {
    display: none;
    background: none;
    border: none;
    padding: var(--space-sm);
    cursor: pointer;
}

.hamburger {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 24px;
}

.hamburger span {
    display: block;
    height: 2px;
    background: var(--color-navy);
    border-radius: 2px;
    transition: all var(--transition-fast);
}

.hamburger.open span:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
}

.hamburger.open span:nth-child(2) {
    opacity: 0;
}

.hamburger.open span:nth-child(3) {
    transform: rotate(-45deg) translate(5px, -5px);
}

/* Mobile Menu */
.mobile-menu {
    display: none;
    flex-direction: column;
    padding: var(--space-md) var(--space-lg);
    background: var(--color-white);
    border-top: 1px solid var(--color-border);
}

.mobile-menu.open {
    display: flex;
}

.mobile-link {
    display: block;
    padding: var(--space-md);
    font-family: var(--font-heading);
    font-weight: 500;
    color: var(--color-slate);
    text-decoration: none;
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
    background: none;
    border: none;
    text-align: left;
    width: 100%;
    cursor: pointer;
    font-size: 1rem;
}

.mobile-link:hover {
    background: var(--color-bg-alt);
    color: var(--color-teal);
}

.mobile-link.highlight {
    background: var(--color-teal);
    color: var(--color-white);
}

.mobile-link.highlight:hover {
    background: var(--color-teal-dark);
    color: var(--color-white);
}

.logout-btn {
    color: var(--color-error);
}

@media (max-width: 768px) {
    .navbar-links {
        display: none;
    }
    
    .mobile-menu-btn {
        display: block;
    }
}
</style>
