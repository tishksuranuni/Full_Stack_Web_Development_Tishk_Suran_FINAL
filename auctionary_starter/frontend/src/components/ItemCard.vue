<script setup>
/**
 * ItemCard Component
 * Displays an auction item in a card format with countdown timer
 */

import { computed } from 'vue';
import CountdownTimer from './CountdownTimer.vue';

const props = defineProps({
    item: {
        type: Object,
        required: true
    },
    showSeller: {
        type: Boolean,
        default: true
    }
});

const isEnded = computed(() => {
    return props.item.end_date <= Date.now();
});

// Generate a pseudo-random element symbol based on item name
const elementSymbol = computed(() => {
    const name = props.item.name || '';
    if (name.length === 0) return 'Au';
    if (name.length === 1) return name.toUpperCase();
    return name.charAt(0).toUpperCase() + name.charAt(1).toLowerCase();
});

// Pseudo-random atomic number based on item_id
const atomicNumber = computed(() => {
    return props.item.item_id % 118 + 1;
});

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP'
    }).format(amount);
}
</script>

<template>
    <router-link 
        :to="`/item/${item.item_id}`" 
        class="item-card card card-clickable"
        :class="{ ended: isEnded }"
    >
        <!-- Element Badge (Chemistry Theme) -->
        <div class="card-header">
            <div class="element-badge">
                <span class="number">{{ atomicNumber }}</span>
                <span class="symbol">{{ elementSymbol }}</span>
            </div>
            <span v-if="isEnded" class="badge badge-ended">Ended</span>
            <span v-else class="badge badge-live">Live</span>
        </div>
        
        <!-- Item Info -->
        <div class="card-body">
            <h3 class="item-name">{{ item.name }}</h3>
            <p class="item-description">{{ item.description }}</p>
            
            <div v-if="showSeller" class="item-seller">
                <span class="seller-label">Listed by</span>
                <span class="seller-name">{{ item.first_name }} {{ item.last_name }}</span>
            </div>
        </div>
        
        <!-- Footer with timer and current bid -->
        <div class="card-footer">
            <div class="time-remaining">
                <template v-if="!isEnded">
                    <CountdownTimer :end-date="item.end_date" compact />
                </template>
                <template v-else>
                    <span class="ended-text">Auction ended</span>
                </template>
            </div>
            
            <div class="current-bid">
                <span class="bid-label">{{ isEnded ? 'Final' : 'Current' }}</span>
                <span class="bid-amount">{{ formatCurrency(item.current_bid || item.starting_bid || 0) }}</span>
            </div>
        </div>
    </router-link>
</template>

<style scoped>
.item-card {
    display: flex;
    flex-direction: column;
    text-decoration: none;
    color: inherit;
    overflow: hidden;
}

.item-card.ended {
    opacity: 0.75;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-md);
}

.element-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: var(--color-navy);
    color: var(--color-white);
    border-radius: var(--radius-sm);
    font-family: var(--font-heading);
}

.element-badge .symbol {
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1;
}

.element-badge .number {
    font-size: 0.625rem;
    opacity: 0.7;
    margin-bottom: 2px;
}

.card-body {
    flex: 1;
}

.item-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-navy);
    margin-bottom: var(--space-xs);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.item-description {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-bottom: var(--space-md);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.item-seller {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.8125rem;
}

.seller-label {
    color: var(--color-text-muted);
}

.seller-name {
    color: var(--color-slate);
    font-weight: 500;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-top: var(--space-md);
    margin-top: var(--space-md);
    border-top: 1px solid var(--color-border);
}

.time-remaining {
    font-size: 0.8125rem;
}

.ended-text {
    color: var(--color-text-muted);
}

.current-bid {
    text-align: right;
}

.bid-label {
    display: block;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.bid-amount {
    display: block;
    font-family: var(--font-heading);
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-teal);
}

.item-card.ended .bid-amount {
    color: var(--color-slate);
}
</style>
