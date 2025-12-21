<script setup>
/**
 * SearchView - Search and Browse Auctions
 * Supports filtering by status (OPEN, BID, ARCHIVE) and text search
 */

import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/stores/auth';
import { itemService } from '@/services/api';
import ItemCard from '@/components/ItemCard.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import EmptyState from '@/components/EmptyState.vue';
import ErrorAlert from '@/components/ErrorAlert.vue';

const route = useRoute();
const router = useRouter();
const { isLoggedIn } = useAuth();

// Search state
const searchQuery = ref('');
const selectedStatus = ref('');
const items = ref([]);
const loading = ref(false);
const error = ref(null);

// Pagination
const limit = 12;
const offset = ref(0);
const hasMore = ref(true);

// Status filter options
const statusFilters = [
    { value: '', label: 'All Auctions', icon: 'grid', requiresAuth: false },
    { value: 'ARCHIVE', label: 'Ended', icon: 'clock', requiresAuth: false },
    { value: 'OPEN', label: 'My Listings', icon: 'tag', requiresAuth: true },
    { value: 'BID', label: 'My Bids', icon: 'hand', requiresAuth: true }
];

// Available filters based on auth
const availableFilters = computed(() => {
    return statusFilters.filter(f => !f.requiresAuth || isLoggedIn.value);
});

// Initialize from URL params
onMounted(() => {
    const q = route.query.q;
    const status = route.query.status;
    
    if (q) searchQuery.value = q;
    if (status) selectedStatus.value = status;
    
    search();
});

// Watch for URL changes
watch(() => route.query, (newQuery) => {
    const q = newQuery.q || '';
    const status = newQuery.status || '';
    
    if (q !== searchQuery.value || status !== selectedStatus.value) {
        searchQuery.value = q;
        selectedStatus.value = status;
        offset.value = 0;
        search();
    }
});

// Search function
async function search(loadMore = false) {
    if (loading.value) return;
    
    loading.value = true;
    error.value = null;
    
    if (!loadMore) {
        offset.value = 0;
        items.value = [];
    }
    
    try {
        const params = {
            limit,
            offset: offset.value
        };
        
        if (searchQuery.value.trim()) {
            params.q = searchQuery.value.trim();
        }
        
        if (selectedStatus.value) {
            params.status = selectedStatus.value;
        }
        
        const results = await itemService.search(params);
        
        if (loadMore) {
            items.value = [...items.value, ...results];
        } else {
            items.value = results;
        }
        
        hasMore.value = results.length === limit;
    } catch (err) {
        error.value = err.message || 'Failed to search auctions';
    } finally {
        loading.value = false;
    }
}

// Handle search submit
function handleSearch() {
    // Update URL
    const query = {};
    if (searchQuery.value.trim()) query.q = searchQuery.value.trim();
    if (selectedStatus.value) query.status = selectedStatus.value;
    
    router.push({ query });
}

// Handle filter change
function setFilter(status) {
    selectedStatus.value = status;
    handleSearch();
}

// Load more
function loadMore() {
    offset.value += limit;
    search(true);
}

// Clear search
function clearSearch() {
    searchQuery.value = '';
    selectedStatus.value = '';
    router.push({ query: {} });
}
</script>

<template>
    <div class="search-view page">
        <div class="container">
            <!-- Search Header -->
            <header class="search-header">
                <h1>Browse Auctions</h1>
                <p>Discover unique items and place your bids</p>
            </header>
            
            <!-- Search Bar -->
            <form @submit.prevent="handleSearch" class="search-bar">
                <div class="search-input-wrapper">
                    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search auctions..."
                        class="search-input"
                    />
                    <button 
                        v-if="searchQuery"
                        type="button"
                        class="clear-btn"
                        @click="searchQuery = ''; handleSearch()"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <button type="submit" class="btn btn-primary search-btn">
                    Search
                </button>
            </form>
            
            <!-- Filters -->
            <nav class="filters">
                <button
                    v-for="filter in availableFilters"
                    :key="filter.value"
                    :class="['filter-btn', { active: selectedStatus === filter.value }]"
                    @click="setFilter(filter.value)"
                >
                    <svg v-if="filter.icon === 'grid'" class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7"/>
                        <rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/>
                    </svg>
                    <svg v-else-if="filter.icon === 'clock'" class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    <svg v-else-if="filter.icon === 'tag'" class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                        <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                    <svg v-else class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4h1v16h-1a4 4 0 01-4-4V8a4 4 0 014-4z"/>
                        <path d="M12 4v16"/>
                    </svg>
                    {{ filter.label }}
                </button>
            </nav>
            
            <!-- Active Search Info -->
            <div v-if="searchQuery || selectedStatus" class="active-search">
                <span>
                    Showing results
                    <template v-if="searchQuery"> for "{{ searchQuery }}"</template>
                    <template v-if="selectedStatus">
                        in {{ statusFilters.find(f => f.value === selectedStatus)?.label }}
                    </template>
                </span>
                <button @click="clearSearch" class="clear-all">
                    Clear all
                </button>
            </div>
            
            <!-- Error -->
            <ErrorAlert 
                v-if="error" 
                :message="error"
                type="error"
                @dismiss="error = null"
            >
                <template #action>
                    <button @click="search()" class="btn btn-outline">
                        Try Again
                    </button>
                </template>
            </ErrorAlert>
            
            <!-- Results -->
            <div class="results-section">
                <!-- Loading (initial) -->
                <div v-if="loading && items.length === 0" class="loading-container">
                    <LoadingSpinner size="lg" />
                </div>
                
                <!-- Items Grid -->
                <template v-else-if="items.length > 0">
                    <div class="items-grid">
                        <ItemCard
                            v-for="item in items"
                            :key="item.item_id"
                            :item="item"
                        />
                    </div>
                    
                    <!-- Load More -->
                    <div v-if="hasMore" class="load-more">
                        <button 
                            @click="loadMore"
                            :disabled="loading"
                            class="btn btn-outline"
                        >
                            <LoadingSpinner v-if="loading" size="sm" />
                            {{ loading ? 'Loading...' : 'Load More' }}
                        </button>
                    </div>
                    
                    <!-- Results count -->
                    <div class="results-info">
                        Showing {{ items.length }} auction{{ items.length !== 1 ? 's' : '' }}
                    </div>
                </template>
                
                <!-- Empty State -->
                <EmptyState v-else icon="search">
                    <template #title>No auctions found</template>
                    <template #description>
                        <template v-if="searchQuery">
                            No results match "{{ searchQuery }}". Try different keywords or clear your search.
                        </template>
                        <template v-else-if="selectedStatus === 'OPEN'">
                            You haven't listed any auctions yet.
                        </template>
                        <template v-else-if="selectedStatus === 'BID'">
                            You haven't placed any bids yet.
                        </template>
                        <template v-else>
                            No auctions are currently available. Check back soon!
                        </template>
                    </template>
                    <template #action>
                        <button v-if="searchQuery || selectedStatus" @click="clearSearch" class="btn btn-outline">
                            Clear Filters
                        </button>
                        <router-link v-else-if="isLoggedIn" to="/create" class="btn btn-primary">
                            Create Auction
                        </router-link>
                    </template>
                </EmptyState>
            </div>
        </div>
    </div>
</template>

<style scoped>
.search-view {
    padding: var(--space-xl) 0;
}

/* Header */
.search-header {
    text-align: center;
    margin-bottom: var(--space-xl);
}

.search-header h1 {
    font-size: 2rem;
    margin: 0 0 var(--space-sm);
}

.search-header p {
    color: var(--color-text-muted);
    margin: 0;
}

/* Search Bar */
.search-bar {
    display: flex;
    gap: var(--space-md);
    max-width: 640px;
    margin: 0 auto var(--space-xl);
}

.search-input-wrapper {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: var(--space-md);
    width: 20px;
    height: 20px;
    color: var(--color-text-muted);
    pointer-events: none;
}

.search-input {
    padding-left: calc(var(--space-md) + 28px);
    padding-right: calc(var(--space-md) + 32px);
}

.clear-btn {
    position: absolute;
    right: var(--space-sm);
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    color: var(--color-text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
}

.clear-btn:hover {
    background: var(--color-slate-100);
    color: var(--color-text);
}

.clear-btn svg {
    width: 16px;
    height: 16px;
}

.search-btn {
    flex-shrink: 0;
}

/* Filters */
.filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    justify-content: center;
    margin-bottom: var(--space-xl);
}

.filter-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--color-border);
    background: white;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-muted);
    cursor: pointer;
    border-radius: var(--radius-full);
    transition: all 0.2s ease;
}

.filter-btn:hover {
    border-color: var(--color-navy);
    color: var(--color-navy);
}

.filter-btn.active {
    background: var(--color-navy);
    border-color: var(--color-navy);
    color: white;
}

.filter-icon {
    width: 16px;
    height: 16px;
}

/* Active Search */
.active-search {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
    font-size: 0.9375rem;
    color: var(--color-text-muted);
}

.clear-all {
    background: none;
    border: none;
    color: var(--color-teal);
    cursor: pointer;
    font-weight: 500;
}

.clear-all:hover {
    text-decoration: underline;
}

/* Results */
.loading-container {
    display: flex;
    justify-content: center;
    padding: var(--space-3xl);
}

.items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-lg);
}

.load-more {
    display: flex;
    justify-content: center;
    margin-top: var(--space-2xl);
}

.results-info {
    text-align: center;
    margin-top: var(--space-xl);
    font-size: 0.875rem;
    color: var(--color-text-muted);
}

/* Responsive */
@media (max-width: 640px) {
    .search-bar {
        flex-direction: column;
    }
    
    .search-btn {
        width: 100%;
    }
    
    .filters {
        gap: var(--space-xs);
    }
    
    .filter-btn {
        padding: var(--space-xs) var(--space-sm);
        font-size: 0.8125rem;
    }
}
</style>
