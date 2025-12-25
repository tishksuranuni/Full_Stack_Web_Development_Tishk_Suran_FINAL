<script setup>
/**
 * HomeView - Landing Page
 * Shows featured auctions and search functionality
 */

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { itemService } from '@/services/api';
import { useAuth } from '@/stores/auth';
import ItemCard from '@/components/ItemCard.vue';
import ItemCardSkeleton from '@/components/ItemCardSkeleton.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import ErrorAlert from '@/components/ErrorAlert.vue';
import EmptyState from '@/components/EmptyState.vue';

const router = useRouter();
const { isLoggedIn } = useAuth();

const searchQuery = ref('');
const featuredItems = ref([]);
const loading = ref(true);
const error = ref(null);

async function loadFeaturedItems() {
    loading.value = true;
    error.value = null;
    
    try {
        // Load recent active auctions
        featuredItems.value = await itemService.search({ limit: 8 });
    } catch (err) {
        error.value = err.message;
    } finally {
        loading.value = false;
    }
}

function handleSearch() {
    if (searchQuery.value.trim()) {
        router.push({ 
            name: 'search', 
            query: { q: searchQuery.value.trim() } 
        });
    } else {
        router.push({ name: 'search' });
    }
}

onMounted(loadFeaturedItems);
</script>

<template>
    <div class="home-view">
        <!-- Hero Section -->
        <section class="hero section-decorated">
            <div class="container">
                <div class="hero-content">
                    <h1 class="hero-title">
                        The Chemistry<br/>
                        <span class="highlight">Marketplace</span>
                    </h1>
                    <p class="hero-subtitle">
                        Have you ever wanted to buy one gram of Plutonium, maybe some Polonium or some Thallium online? I hope not, but if you did, this is the website for you!
                    </p>

                    <!-- Search Form -->
                    <form @submit.prevent="handleSearch" class="search-form">
                        <div class="search-input-wrapper">
                            <label for="hero-search" class="sr-only">Search for periodic elements</label>
                            <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
                            </svg>
                            <input
                                id="hero-search"
                                v-model="searchQuery"
                                type="text"
                                placeholder="Search for periodic elements..."
                                class="search-input"
                            />
                        </div>
                        <button type="submit" class="btn btn-accent btn-lg">
                            Search
                        </button>
                    </form>

                    <!-- Quick Actions -->
                    <div class="quick-actions">
                        <router-link to="/search" class="quick-link">
                            Browse questionable auctions
                        </router-link>
                        <span class="divider">•</span>
                        <router-link v-if="isLoggedIn" to="/create" class="quick-link">
                            Sell some elements
                        </router-link>
                        <router-link v-else to="/register" class="quick-link">
                            Create an account
                        </router-link>
                    </div>
                </div>

                <!-- Decorative Element -->
                <div class="hero-decoration">
                    <svg viewBox="0 0 200 200" fill="none" class="hex-decoration">
                        <polygon points="100,10 180,55 180,145 100,190 20,145 20,55"
                                 fill="none" stroke="currentColor" stroke-width="2" opacity="0.1" class="hex-ring hex-ring-1"/>
                        <polygon points="100,30 160,65 160,135 100,170 40,135 40,65"
                                 fill="none" stroke="currentColor" stroke-width="2" opacity="0.15" class="hex-ring hex-ring-2"/>
                        <polygon points="100,50 140,75 140,125 100,150 60,125 60,75"
                                 fill="none" stroke="currentColor" stroke-width="2" opacity="0.2" class="hex-ring hex-ring-3"/>
                        <circle cx="100" cy="100" r="20" fill="currentColor" opacity="0.15" class="hex-core"/>
                    </svg>
                </div>
            </div>
        </section>
        
        <!-- Featured Auctions -->
        <section class="featured-section page">
            <div class="container">
                <div class="section-header">
                    <h2>Live Auctions</h2>
                    <router-link to="/search" class="view-all-link">
                        View all
                        <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                        </svg>
                    </router-link>
                </div>
                
                <div v-if="loading" class="featured-grid">
                    <ItemCardSkeleton v-for="i in 8" :key="`skeleton-${i}`" />
                </div>
                
                <ErrorAlert 
                    v-else-if="error" 
                    :message="error"
                    @retry="loadFeaturedItems"
                />
                
                <EmptyState 
                    v-else-if="featuredItems.length === 0"
                    title="No Elements Available"
                    message="Be the first to list something that probably should not be sold online!"
                    icon="beaker"
                >
                    <template #action>
                        <router-link v-if="isLoggedIn" to="/create" class="btn btn-primary">
                            Create Auction
                        </router-link>
                        <router-link v-else to="/register" class="btn btn-primary">
                            Get Started
                        </router-link>
                    </template>
                </EmptyState>
                
                <div v-else class="items-grid grid grid-4">
                    <ItemCard 
                        v-for="item in featuredItems" 
                        :key="item.item_id"
                        :item="item"
                        class="stagger-item"
                    />
                </div>
            </div>
        </section>
        
        <!-- Features Section -->
        <section class="features-section">
            <div class="container">
                <div class="features-grid grid grid-3">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <h3>Real-time Updates</h3>
                        <p>Live countdown timers and instant bid notifications keep you informed.</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                            </svg>
                        </div>
                        <h3>Direct Q&A</h3>
                        <p>Ask sellers questions directly. Get answers before you bid.</p>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                            </svg>
                        </div>
                        <h3>Elemental Categories</h3>
                        <p>Browse by periodic table groups. Find exactly the element you need.</p>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
.home-view {
    display: flex;
    flex-direction: column;
}

/* Smooth Animations */
@keyframes smoothFadeUp {
    0% {
        opacity: 0;
        transform: translateY(15px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes gentleFloat {
    0%, 100% {
        transform: translateY(0) scale(1);
    }
    50% {
        transform: translateY(-8px) scale(1.02);
    }
}

@keyframes subtlePulse {
    0%, 100% {
        opacity: 0.15;
        transform: scale(1);
    }
    50% {
        opacity: 0.25;
        transform: scale(1.05);
    }
}

/* Hero content cascade */
.hero-content > * {
    animation: smoothFadeUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
    will-change: opacity, transform;
}

.hero-title {
    animation-delay: 0.15s;
}

.hero-subtitle {
    animation-delay: 0.35s;
}

.search-form {
    animation-delay: 0.55s;
}

.quick-actions {
    animation-delay: 0.75s;
}

/* Grid items */
.stagger-item {
    opacity: 1;
}

/* Hero Section */
.hero {
    background: linear-gradient(135deg, var(--color-navy) 0%, var(--color-navy-light) 100%);
    color: var(--color-white);
    padding: var(--space-3xl) 0;
    position: relative;
    overflow: hidden;
}

.hero .container {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--space-2xl);
    align-items: center;
}

.hero-content {
    position: relative;
    z-index: 1;
}

.hero-title {
    font-size: 3rem;
    font-weight: 700;
    line-height: 1.1;
    margin-bottom: var(--space-lg);
    color: var(--color-white);
}

.hero-title .highlight {
    color: var(--color-amber);
}

.hero-subtitle {
    font-size: 1.125rem;
    color: rgba(255, 255, 255, 0.8);
    max-width: 500px;
    margin-bottom: var(--space-xl);
}

.search-form {
    display: flex;
    gap: var(--space-md);
    max-width: 560px;
}

.search-input-wrapper {
    flex: 1;
    position: relative;
}

.search-icon {
    position: absolute;
    left: var(--space-md);
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: var(--color-slate-light);
}

.search-input {
    width: 100%;
    padding: var(--space-md) var(--space-md) var(--space-md) calc(var(--space-md) * 2 + 20px);
    font-size: 1rem;
    border-radius: var(--radius-lg);
    border: 2px solid transparent;
}

.search-input:focus {
    border-color: var(--color-teal);
}

.quick-actions {
    margin-top: var(--space-lg);
    display: flex;
    align-items: center;
    gap: var(--space-md);
}

.quick-link {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9375rem;
    transition: color var(--transition-fast);
}

.quick-link:hover {
    color: var(--color-white);
}

.divider {
    color: rgba(255, 255, 255, 0.4);
}

.hero-decoration {
    position: relative;
    width: 240px;
    height: 240px;
    color: var(--color-teal);
    animation: smoothFadeUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.95s both;
    display: flex;
    align-items: center;
    justify-content: center;
}

.hex-decoration {
    width: 100%;
    height: 100%;
    animation: gentleFloat 8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite 2s;
    display: block;
    will-change: transform;
}

.hex-core {
    animation: subtlePulse 4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite 2.5s;
    transform-origin: center;
    will-change: opacity, transform;
}

/* Featured Section */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-xl);
}

.section-header h2 {
    margin: 0;
}

.view-all-link {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-family: var(--font-heading);
    font-weight: 500;
    font-size: 0.9375rem;
}

.view-all-link svg {
    width: 16px;
    height: 16px;
}

/* Features Section */
.features-section {
    background: var(--color-bg-alt);
    padding: var(--space-3xl) 0;
}

.feature-card {
    text-align: center;
    padding: var(--space-xl);
    border-radius: var(--radius-lg);
    transition: all 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-4px);
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.feature-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto var(--space-md);
    color: var(--color-teal);
    transition: transform 0.3s ease;
}

.feature-card:hover .feature-icon {
    transform: scale(1.1);
}

.feature-icon svg {
    width: 100%;
    height: 100%;
}

.feature-card h3 {
    font-size: 1.125rem;
    margin-bottom: var(--space-sm);
    font-weight: 600;
}

.feature-card p {
    color: var(--color-text-muted);
    font-size: 0.9375rem;
    margin: 0;
    line-height: 1.6;
}

/* Responsive */
@media (max-width: 1024px) {
    .hero .container {
        grid-template-columns: 1fr;
    }
    
    .hero-decoration {
        display: none;
    }
}

@media (max-width: 640px) {
    .hero-title {
        font-size: 2rem;
    }
    
    .search-form {
        flex-direction: column;
    }
    
    .quick-actions {
        flex-direction: column;
        gap: var(--space-sm);
    }
    
    .divider {
        display: none;
    }
}
</style>
