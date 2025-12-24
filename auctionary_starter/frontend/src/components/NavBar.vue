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
                        <!-- Hexagonal shape (like periodic table element) -->
                        <polygon
                            points="16,4 26,10 26,22 16,28 6,22 6,10"
                            stroke="currentColor"
                            stroke-width="2"
                            fill="none"
                        />
                        <!-- Central element symbol -->
                        <circle cx="16" cy="16" r="5" fill="currentColor"/>
                        <circle cx="16" cy="16" r="3" fill="white" opacity="0.3"/>
                    </svg>
                </div>
                <span class="brand-text">Elemental Exchange</span>
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
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.navbar-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 72px;
}

.navbar-brand {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    color: var(--color-navy);
    text-decoration: none;
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 1.125rem;
    letter-spacing: -0.01em;
    transition: all 0.2s ease;
}

.navbar-brand:hover {
    color: var(--color-teal);
}

.navbar-brand:hover .brand-icon {
    transform: translateY(-1px);
}

.brand-icon {
    width: 36px;
    height: 36px;
    transition: transform 0.2s ease;
}

.brand-icon svg {
    width: 100%;
    height: 100%;
}

.brand-text {
    background: linear-gradient(135deg, var(--color-navy) 0%, var(--color-teal) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.navbar-links {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
}

.nav-link {
    font-family: var(--font-heading);
    font-weight: 500;
    font-size: 0.9375rem;
    color: var(--color-text-muted);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    transition: all 0.2s ease;
    position: relative;
}

.nav-link::after {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 80%;
    height: 2px;
    background: var(--color-teal);
    border-radius: 2px;
    transition: transform 0.2s ease;
}

.nav-link:hover {
    color: var(--color-navy);
}

.nav-link:hover::after {
    transform: translateX(-50%) scaleX(1);
}

.nav-link.router-link-active {
    color: var(--color-teal);
    font-weight: 600;
}

.nav-link.router-link-active::after {
    transform: translateX(-50%) scaleX(1);
}

.nav-btn {
    margin-left: var(--space-md);
    font-weight: 500;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
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
