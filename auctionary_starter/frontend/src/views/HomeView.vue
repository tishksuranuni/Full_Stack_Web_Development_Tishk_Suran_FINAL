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
                            <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
                            </svg>
                            <input 
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
                                 fill="none" stroke="currentColor" stroke-width="2" opacity="0.1"/>
                        <polygon points="100,30 160,65 160,135 100,170 40,135 40,65" 
                                 fill="none" stroke="currentColor" stroke-width="2" opacity="0.15"/>
                        <polygon points="100,50 140,75 140,125 100,150 60,125 60,75" 
                                 fill="none" stroke="currentColor" stroke-width="2" opacity="0.2"/>
                        <circle cx="100" cy="100" r="20" fill="currentColor" opacity="0.15"/>
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
                
                <LoadingSpinner v-if="loading" message="Loading auctions..." />
                
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
    width: 200px;
    height: 200px;
    color: var(--color-teal);
}

.hex-decoration {
    width: 100%;
    height: 100%;
    animation: float 6s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
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
}

.feature-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto var(--space-md);
    color: var(--color-teal);
}

.feature-icon svg {
    width: 100%;
    height: 100%;
}

.feature-card h3 {
    font-size: 1.125rem;
    margin-bottom: var(--space-sm);
}

.feature-card p {
    color: var(--color-text-muted);
    font-size: 0.9375rem;
    margin: 0;
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
