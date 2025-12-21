<script setup>
/**
 * ProfileView - User Profile with Auction Tabs
 * Shows: selling, bidding_on, auctions_ended
 */

import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/stores/auth';
import { userService } from '@/services/api';
import ItemCard from '@/components/ItemCard.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import EmptyState from '@/components/EmptyState.vue';
import ErrorAlert from '@/components/ErrorAlert.vue';

const route = useRoute();
const { currentUserId } = useAuth();

const profile = ref(null);
const loading = ref(true);
const error = ref(null);
const activeTab = ref('selling');

// Determine which user to display
const profileUserId = computed(() => {
    const routeId = route.params.id;
    if (routeId) {
        return parseInt(routeId, 10);
    }
    return currentUserId.value;
});

// Check if viewing own profile
const isOwnProfile = computed(() => {
    return profileUserId.value === currentUserId.value;
});

// Tab definitions
const tabs = [
    { key: 'selling', label: 'Selling', icon: 'tag' },
    { key: 'bidding_on', label: 'Bidding On', icon: 'hand' },
    { key: 'auctions_ended', label: 'Ended', icon: 'clock' }
];

// Current tab items
const currentItems = computed(() => {
    if (!profile.value) return [];
    return profile.value[activeTab.value] || [];
});

// Load profile data
async function loadProfile() {
    if (!profileUserId.value) {
        error.value = 'No user specified';
        loading.value = false;
        return;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
        profile.value = await userService.getProfile(profileUserId.value);
    } catch (err) {
        error.value = err.message || 'Failed to load profile';
    } finally {
        loading.value = false;
    }
}

// Watch for route changes
watch(() => route.params.id, () => {
    loadProfile();
});

onMounted(loadProfile);
</script>

<template>
    <div class="profile-view page">
        <div class="container">
            <!-- Loading State -->
            <div v-if="loading" class="loading-container">
                <LoadingSpinner size="lg" />
            </div>
            
            <!-- Error State -->
            <ErrorAlert 
                v-else-if="error" 
                :message="error"
                type="error"
            >
                <template #action>
                    <button @click="loadProfile" class="btn btn-outline">
                        Try Again
                    </button>
                </template>
            </ErrorAlert>
            
            <!-- Profile Content -->
            <template v-else-if="profile">
                <!-- Profile Header -->
                <header class="profile-header">
                    <div class="profile-avatar">
                        <span class="avatar-initials">
                            {{ profile.first_name?.[0] }}{{ profile.last_name?.[0] }}
                        </span>
                    </div>
                    <div class="profile-info">
                        <h1>{{ profile.first_name }} {{ profile.last_name }}</h1>
                        <p v-if="isOwnProfile" class="profile-label">Your Profile</p>
                    </div>
                    
                    <!-- Quick stats -->
                    <div class="profile-stats">
                        <div class="stat">
                            <span class="stat-value">{{ profile.selling?.length || 0 }}</span>
                            <span class="stat-label">Active Listings</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">{{ profile.bidding_on?.length || 0 }}</span>
                            <span class="stat-label">Active Bids</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">{{ profile.auctions_ended?.length || 0 }}</span>
                            <span class="stat-label">Completed</span>
                        </div>
                    </div>
                </header>
                
                <!-- Tabs Navigation -->
                <nav class="tabs-nav">
                    <button
                        v-for="tab in tabs"
                        :key="tab.key"
                        :class="['tab-btn', { active: activeTab === tab.key }]"
                        @click="activeTab = tab.key"
                    >
                        <svg v-if="tab.icon === 'tag'" class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                            <line x1="7" y1="7" x2="7.01" y2="7"/>
                        </svg>
                        <svg v-else-if="tab.icon === 'hand'" class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4h1v16h-1a4 4 0 01-4-4V8a4 4 0 014-4z"/>
                            <path d="M12 4v16"/>
                            <path d="M12 4c0-1.1.9-2 2-2s2 .9 2 2v7"/>
                            <path d="M16 7c0-1.1.9-2 2-2s2 .9 2 2v6a6 6 0 01-6 6H8"/>
                        </svg>
                        <svg v-else class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        <span>{{ tab.label }}</span>
                        <span class="tab-count">{{ profile[tab.key]?.length || 0 }}</span>
                    </button>
                </nav>
                
                <!-- Tab Content -->
                <div class="tab-content">
                    <!-- Items Grid -->
                    <div v-if="currentItems.length > 0" class="items-grid">
                        <ItemCard
                            v-for="item in currentItems"
                            :key="item.item_id"
                            :item="item"
                        />
                    </div>
                    
                    <!-- Empty State -->
                    <EmptyState v-else :icon="activeTab === 'selling' ? 'beaker' : activeTab === 'bidding_on' ? 'bid' : 'folder'">
                        <template #title>
                            <span v-if="activeTab === 'selling'">
                                {{ isOwnProfile ? 'No active listings' : 'No listings yet' }}
                            </span>
                            <span v-else-if="activeTab === 'bidding_on'">
                                {{ isOwnProfile ? 'Not bidding on anything' : 'No active bids' }}
                            </span>
                            <span v-else>No ended auctions</span>
                        </template>
                        <template #description>
                            <span v-if="activeTab === 'selling' && isOwnProfile">
                                Start selling by creating your first auction.
                            </span>
                            <span v-else-if="activeTab === 'bidding_on' && isOwnProfile">
                                Browse auctions and place your first bid.
                            </span>
                            <span v-else>
                                Auctions that have ended will appear here.
                            </span>
                        </template>
                        <template #action v-if="isOwnProfile && activeTab === 'selling'">
                            <router-link to="/create" class="btn btn-primary">
                                Create Auction
                            </router-link>
                        </template>
                        <template #action v-else-if="isOwnProfile && activeTab === 'bidding_on'">
                            <router-link to="/search" class="btn btn-primary">
                                Browse Auctions
                            </router-link>
                        </template>
                    </EmptyState>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.profile-view {
    padding: var(--space-xl) 0;
}

.loading-container {
    display: flex;
    justify-content: center;
    padding: var(--space-3xl);
}

/* Profile Header */
.profile-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-lg);
    margin-bottom: var(--space-2xl);
    padding-bottom: var(--space-xl);
    border-bottom: 1px solid var(--color-border);
}

.profile-avatar {
    width: 80px;
    height: 80px;
    border-radius: var(--radius-lg);
    background: linear-gradient(135deg, var(--color-navy), var(--color-teal));
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.avatar-initials {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    text-transform: uppercase;
}

.profile-info {
    flex: 1;
    min-width: 200px;
}

.profile-info h1 {
    font-size: 1.75rem;
    margin: 0 0 var(--space-xs);
}

.profile-label {
    color: var(--color-text-muted);
    font-size: 0.875rem;
    margin: 0;
}

.profile-stats {
    display: flex;
    gap: var(--space-xl);
    margin-left: auto;
}

.stat {
    text-align: center;
}

.stat-value {
    display: block;
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-navy);
}

.stat-label {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
}

/* Tabs Navigation */
.tabs-nav {
    display: flex;
    gap: var(--space-sm);
    margin-bottom: var(--space-xl);
    border-bottom: 1px solid var(--color-border);
    padding-bottom: var(--space-sm);
    overflow-x: auto;
}

.tab-btn {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    border: none;
    background: none;
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--color-text-muted);
    cursor: pointer;
    border-radius: var(--radius-md);
    transition: all 0.2s ease;
    white-space: nowrap;
}

.tab-btn:hover {
    color: var(--color-navy);
    background: var(--color-slate-100);
}

.tab-btn.active {
    color: var(--color-teal);
    background: rgba(13, 148, 136, 0.1);
}

.tab-icon {
    width: 18px;
    height: 18px;
}

.tab-count {
    background: var(--color-slate-100);
    padding: 2px 8px;
    border-radius: var(--radius-full);
    font-size: 0.8125rem;
    font-weight: 600;
}

.tab-btn.active .tab-count {
    background: rgba(13, 148, 136, 0.2);
    color: var(--color-teal);
}

/* Items Grid */
.items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-lg);
}

/* Responsive */
@media (max-width: 768px) {
    .profile-header {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .profile-stats {
        margin-left: 0;
        width: 100%;
        justify-content: space-around;
    }
    
    .tabs-nav {
        gap: var(--space-xs);
    }
    
    .tab-btn {
        padding: var(--space-sm);
        font-size: 0.875rem;
    }
}
</style>
