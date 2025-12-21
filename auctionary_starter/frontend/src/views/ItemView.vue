<script setup>
/**
 * ItemView - Single Auction Item Page
 * Displays full item details, bidding, and Q&A
 */

import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/stores/auth';
import { itemService } from '@/services/api';
import CountdownTimer from '@/components/CountdownTimer.vue';
import BidSection from '@/components/BidSection.vue';
import QuestionSection from '@/components/QuestionSection.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import ErrorAlert from '@/components/ErrorAlert.vue';

const route = useRoute();
const router = useRouter();
const { isLoggedIn, currentUserId } = useAuth();

const item = ref(null);
const loading = ref(true);
const error = ref(null);

// Get item ID from route
const itemId = computed(() => parseInt(route.params.id, 10));

// Check if current user is the owner
const isOwner = computed(() => {
    return item.value && currentUserId.value === item.value.creator_id;
});

// Check if auction has ended
const hasEnded = computed(() => {
    if (!item.value) return false;
    return Date.now() > item.value.end_date;
});

// Check if user is winning
const isWinning = computed(() => {
    if (!item.value?.current_bid_holder) return false;
    return currentUserId.value === item.value.current_bid_holder.user_id;
});

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0
    }).format(amount);
}

// Format date
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Load item data
async function loadItem() {
    if (isNaN(itemId.value)) {
        error.value = 'Invalid item ID';
        loading.value = false;
        return;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
        item.value = await itemService.getOne(itemId.value);
    } catch (err) {
        if (err.status === 404) {
            error.value = 'Auction not found';
        } else {
            error.value = err.message || 'Failed to load auction';
        }
    } finally {
        loading.value = false;
    }
}

// Handle successful bid
function handleBidPlaced() {
    loadItem(); // Refresh item data
}

onMounted(loadItem);
</script>

<template>
    <div class="item-view page">
        <div class="container">
            <!-- Loading -->
            <div v-if="loading" class="loading-container">
                <LoadingSpinner size="lg" />
            </div>
            
            <!-- Error -->
            <ErrorAlert 
                v-else-if="error" 
                :message="error"
                type="error"
            >
                <template #action>
                    <router-link to="/search" class="btn btn-outline">
                        Browse Auctions
                    </router-link>
                </template>
            </ErrorAlert>
            
            <!-- Item Content -->
            <template v-else-if="item">
                <!-- Breadcrumb -->
                <nav class="breadcrumb">
                    <router-link to="/">Home</router-link>
                    <span class="separator">/</span>
                    <router-link to="/search">Auctions</router-link>
                    <span class="separator">/</span>
                    <span class="current">{{ item.name }}</span>
                </nav>
                
                <!-- Status Badge (if ended or winning) -->
                <div v-if="hasEnded || isWinning" class="status-banner" :class="{ ended: hasEnded, winning: isWinning && !hasEnded }">
                    <svg v-if="hasEnded" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4"/>
                        <circle cx="12" cy="12" r="10"/>
                    </svg>
                    <span v-if="hasEnded">
                        This auction has ended
                        <template v-if="isWinning"> — Congratulations, you won!</template>
                        <template v-else-if="isOwner && item.current_bid_holder">
                            — Won by {{ item.current_bid_holder.first_name }} {{ item.current_bid_holder.last_name }}
                        </template>
                    </span>
                    <span v-else>You're currently winning this auction!</span>
                </div>
                
                <div class="item-layout">
                    <!-- Main Content -->
                    <div class="item-main">
                        <!-- Item Header -->
                        <header class="item-header">
                            <div class="element-badge">
                                <span class="element-symbol">{{ item.name?.substring(0, 2).toUpperCase() }}</span>
                                <span class="element-number">#{{ item.item_id }}</span>
                            </div>
                            <div class="header-content">
                                <h1>{{ item.name }}</h1>
                                <div class="seller-info">
                                    Listed by 
                                    <router-link :to="`/profile/${item.creator_id}`" class="seller-link">
                                        {{ item.first_name }} {{ item.last_name }}
                                    </router-link>
                                    <span v-if="isOwner" class="owner-badge">You</span>
                                </div>
                            </div>
                        </header>
                        
                        <!-- Description -->
                        <section class="item-description card">
                            <h2>Description</h2>
                            <p>{{ item.description }}</p>
                        </section>
                        
                        <!-- Details Grid -->
                        <section class="item-details card">
                            <h2>Auction Details</h2>
                            <dl class="details-grid">
                                <div class="detail-item">
                                    <dt>Starting Bid</dt>
                                    <dd>{{ formatCurrency(item.starting_bid) }}</dd>
                                </div>
                                <div class="detail-item">
                                    <dt>Listed</dt>
                                    <dd>{{ formatDate(item.start_date) }}</dd>
                                </div>
                                <div class="detail-item">
                                    <dt>Ends</dt>
                                    <dd>{{ formatDate(item.end_date) }}</dd>
                                </div>
                                <div class="detail-item">
                                    <dt>Item ID</dt>
                                    <dd>#{{ item.item_id }}</dd>
                                </div>
                            </dl>
                        </section>
                        
                        <!-- Questions Section -->
                        <QuestionSection 
                            :item-id="itemId"
                            :is-owner="isOwner"
                            :has-ended="hasEnded"
                        />
                    </div>
                    
                    <!-- Sidebar -->
                    <aside class="item-sidebar">
                        <!-- Bid Card -->
                        <div class="bid-card card">
                            <!-- Current Bid -->
                            <div class="current-bid">
                                <span class="bid-label">
                                    {{ item.current_bid_holder ? 'Current Bid' : 'Starting Bid' }}
                                </span>
                                <span class="bid-amount">{{ formatCurrency(item.current_bid) }}</span>
                                <span v-if="item.current_bid_holder" class="bid-holder">
                                    by {{ item.current_bid_holder.first_name }} {{ item.current_bid_holder.last_name }}
                                    <span v-if="isWinning" class="you-badge">You</span>
                                </span>
                            </div>
                            
                            <!-- Timer -->
                            <div class="timer-section">
                                <CountdownTimer 
                                    :end-date="item.end_date"
                                    :compact="false"
                                />
                            </div>
                            
                            <!-- Bid Section -->
                            <BidSection
                                :item-id="itemId"
                                :current-bid="item.current_bid"
                                :starting-bid="item.starting_bid"
                                :is-owner="isOwner"
                                :has-ended="hasEnded"
                                @bid-placed="handleBidPlaced"
                            />
                        </div>
                        
                        <!-- Quick Actions -->
                        <div v-if="isLoggedIn" class="quick-actions">
                            <router-link v-if="isOwner" to="/create" class="btn btn-outline btn-block">
                                Create Another Auction
                            </router-link>
                            <router-link v-else to="/search" class="btn btn-outline btn-block">
                                Browse More Auctions
                            </router-link>
                        </div>
                    </aside>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.item-view {
    padding: var(--space-xl) 0;
}

.loading-container {
    display: flex;
    justify-content: center;
    padding: var(--space-3xl);
}

/* Breadcrumb */
.breadcrumb {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: 0.875rem;
    margin-bottom: var(--space-lg);
    color: var(--color-text-muted);
}

.breadcrumb a {
    color: var(--color-text-muted);
}

.breadcrumb a:hover {
    color: var(--color-teal);
}

.breadcrumb .separator {
    opacity: 0.5;
}

.breadcrumb .current {
    color: var(--color-text);
    font-weight: 500;
}

/* Status Banner */
.status-banner {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-xl);
    font-weight: 500;
}

.status-banner svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
}

.status-banner.ended {
    background: var(--color-slate-100);
    color: var(--color-text-muted);
}

.status-banner.winning {
    background: rgba(16, 185, 129, 0.1);
    color: var(--color-success);
}

/* Layout */
.item-layout {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: var(--space-2xl);
    align-items: start;
}

/* Item Header */
.item-header {
    display: flex;
    gap: var(--space-lg);
    margin-bottom: var(--space-xl);
}

.element-badge {
    width: 72px;
    height: 72px;
    background: linear-gradient(135deg, var(--color-navy), var(--color-teal));
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
}

.element-symbol {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1;
}

.element-number {
    font-size: 0.6875rem;
    opacity: 0.8;
    margin-top: 2px;
}

.header-content h1 {
    font-size: 1.75rem;
    margin: 0 0 var(--space-xs);
}

.seller-info {
    color: var(--color-text-muted);
    font-size: 0.9375rem;
}

.seller-link {
    font-weight: 500;
}

.owner-badge,
.you-badge {
    display: inline-block;
    background: rgba(13, 148, 136, 0.1);
    color: var(--color-teal);
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    margin-left: var(--space-xs);
}

/* Sections */
.item-description,
.item-details {
    margin-bottom: var(--space-xl);
}

.item-description h2,
.item-details h2 {
    font-size: 1.125rem;
    margin: 0 0 var(--space-md);
}

.item-description p {
    margin: 0;
    line-height: 1.7;
    white-space: pre-wrap;
}

/* Details Grid */
.details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
    margin: 0;
}

.detail-item {
    padding: var(--space-md);
    background: var(--color-slate-50);
    border-radius: var(--radius-sm);
}

.detail-item dt {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    margin-bottom: var(--space-xs);
}

.detail-item dd {
    margin: 0;
    font-weight: 600;
    color: var(--color-navy);
}

/* Sidebar */
.item-sidebar {
    position: sticky;
    top: calc(var(--space-xl) + 70px);
}

.bid-card {
    padding: var(--space-xl);
}

.current-bid {
    text-align: center;
    padding-bottom: var(--space-lg);
    border-bottom: 1px solid var(--color-border);
    margin-bottom: var(--space-lg);
}

.bid-label {
    display: block;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-bottom: var(--space-xs);
}

.bid-amount {
    display: block;
    font-family: var(--font-heading);
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-navy);
}

.bid-holder {
    display: block;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-top: var(--space-xs);
}

.timer-section {
    margin-bottom: var(--space-lg);
}

.quick-actions {
    margin-top: var(--space-lg);
}

.btn-block {
    display: block;
    width: 100%;
    text-align: center;
}

/* Responsive */
@media (max-width: 1024px) {
    .item-layout {
        grid-template-columns: 1fr;
    }
    
    .item-sidebar {
        position: static;
        order: -1;
    }
}

@media (max-width: 640px) {
    .item-header {
        flex-direction: column;
    }
    
    .details-grid {
        grid-template-columns: 1fr;
    }
}
</style>
