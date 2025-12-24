<script setup>
/**
 * BidSection Component
 * Handles placing bids and displaying bid history
 */

import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { bidService } from '@/services/api';
import { useAuth } from '@/stores/auth';
import LoadingSpinner from './LoadingSpinner.vue';
import ErrorAlert from './ErrorAlert.vue';

const props = defineProps({
    itemId: {
        type: Number,
        required: true
    },
    currentBid: {
        type: Number,
        required: true
    },
    isOwner: {
        type: Boolean,
        default: false
    },
    isEnded: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['bidPlaced']);

const router = useRouter();
const { isLoggedIn, currentUserId } = useAuth();

// Form state
const bidAmount = ref('');
const submitting = ref(false);
const submitError = ref(null);
const submitSuccess = ref(false);

// History state
const bidHistory = ref([]);
const historyLoading = ref(true);
const historyError = ref(null);

const minimumBid = computed(() => props.currentBid + 1);

const isWinning = computed(() => {
    if (!isLoggedIn.value || bidHistory.value.length === 0) return false;
    return bidHistory.value[0]?.user_id === currentUserId.value;
});

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP'
    }).format(amount);
}

function formatTime(timestamp) {
    return new Date(timestamp).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function loadBidHistory() {
    historyLoading.value = true;
    historyError.value = null;
    
    try {
        bidHistory.value = await bidService.getHistory(props.itemId);
    } catch (error) {
        historyError.value = error.message;
    } finally {
        historyLoading.value = false;
    }
}

async function handleSubmit() {
    if (!isLoggedIn.value) {
        router.push({ name: 'login', query: { redirect: `/item/${props.itemId}` } });
        return;
    }
    
    const amount = parseInt(bidAmount.value, 10);
    
    if (isNaN(amount) || amount < minimumBid.value) {
        submitError.value = `Bid must be at least ${formatCurrency(minimumBid.value)}`;
        return;
    }
    
    submitting.value = true;
    submitError.value = null;
    submitSuccess.value = false;
    
    try {
        await bidService.placeBid(props.itemId, amount);
        submitSuccess.value = true;
        bidAmount.value = '';
        
        // Refresh bid history
        await loadBidHistory();
        
        // Notify parent to refresh item details
        emit('bidPlaced');
        
        // Clear success message after delay
        setTimeout(() => {
            submitSuccess.value = false;
        }, 3000);
    } catch (error) {
        submitError.value = error.message;
    } finally {
        submitting.value = false;
    }
}

onMounted(loadBidHistory);
</script>

<template>
    <div class="bid-section">
        <!-- Bid Form -->
        <div v-if="!isEnded && !isOwner" class="bid-form-container">
            <h3 class="section-title">Place a Bid</h3>
            
            <div v-if="isWinning" class="winning-badge">
                <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>You're currently winning!</span>
            </div>
            
            <ErrorAlert 
                v-if="submitError" 
                :message="submitError" 
                type="error"
                @dismiss="submitError = null"
            />
            
            <div v-if="submitSuccess" class="alert alert-success">
                Bid placed successfully!
            </div>
            
            <form @submit.prevent="handleSubmit" class="bid-form">
                <div class="form-row">
                    <div class="form-group bid-input-group">
                        <label for="bidAmount">Your Bid (GBP)</label>
                        <div class="input-with-prefix">
                            <span class="prefix">£</span>
                            <input
                                id="bidAmount"
                                v-model="bidAmount"
                                type="number"
                                :min="minimumBid"
                                :placeholder="minimumBid.toString()"
                                :disabled="submitting"
                                required
                            />
                        </div>
                        <span class="form-hint">Minimum: {{ formatCurrency(minimumBid) }}</span>
                    </div>
                    
                    <button
                        type="submit"
                        class="btn btn-accent"
                        :disabled="submitting"
                    >
                        {{ submitting ? 'Placing bid...' : 'Place Bid' }}
                    </button>
                </div>
            </form>
            
            <p v-if="!isLoggedIn" class="login-prompt">
                <router-link :to="{ name: 'login', query: { redirect: `/item/${itemId}` } }">
                    Log in
                </router-link>
                to place a bid
            </p>
        </div>
        
        <div v-else-if="isOwner" class="owner-notice">
            <p>This is your auction - you cannot bid on your own items.</p>
        </div>
        
        <div v-else-if="isEnded" class="ended-notice">
            <p>This auction has ended.</p>
        </div>
        
        <!-- Bid History -->
        <div class="bid-history">
            <h3 class="section-title">Bid History</h3>
            
            <LoadingSpinner v-if="historyLoading" size="small" />
            
            <ErrorAlert 
                v-else-if="historyError" 
                :message="historyError"
                @retry="loadBidHistory"
            />
            
            <div v-else-if="bidHistory.length === 0" class="no-bids">
                <p>No bids yet. Be the first to bid!</p>
            </div>
            
            <ul v-else class="bid-list">
                <li 
                    v-for="(bid, index) in bidHistory" 
                    :key="`${bid.user_id}-${bid.timestamp}`"
                    class="bid-item"
                    :class="{ 
                        winning: index === 0,
                        'is-you': bid.user_id === currentUserId
                    }"
                >
                    <div class="bid-info">
                        <span class="bidder-name">
                            {{ bid.first_name }} {{ bid.last_name }}
                            <span v-if="bid.user_id === currentUserId" class="you-badge">(You)</span>
                        </span>
                        <span class="bid-time">{{ formatTime(bid.timestamp) }}</span>
                    </div>
                    <span class="bid-amount">{{ formatCurrency(bid.amount) }}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.bid-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
}

.section-title {
    font-size: 1.125rem;
    margin-bottom: var(--space-md);
}

.bid-form-container {
    background: var(--color-bg-alt);
    padding: var(--space-lg);
    border-radius: var(--radius-lg);
}

.winning-badge {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background: #fef3c7;
    color: #b45309;
    border-radius: var(--radius-md);
    font-weight: 500;
    font-size: 0.9375rem;
    margin-bottom: var(--space-md);
}

.winning-badge svg {
    width: 20px;
    height: 20px;
}

.bid-form .form-row {
    display: flex;
    gap: var(--space-sm);
    align-items: flex-end;
}

.bid-input-group {
    flex: 0 1 auto;
    margin-bottom: 0;
}

.input-with-prefix {
    display: flex;
    align-items: stretch;
}

.input-with-prefix .prefix {
    display: flex;
    align-items: center;
    padding: 0 var(--space-sm);
    background: var(--color-slate-100);
    border: 1px solid var(--color-border);
    border-right: none;
    border-radius: var(--radius-md) 0 0 var(--radius-md);
    font-weight: 500;
    color: var(--color-slate);
    font-size: 0.875rem;
}

.input-with-prefix input {
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
    flex: 1;
    min-width: 80px;
    max-width: 120px;
}

.login-prompt {
    margin-top: var(--space-md);
    font-size: 0.9375rem;
    color: var(--color-text-muted);
}

.owner-notice,
.ended-notice {
    background: var(--color-bg-alt);
    padding: var(--space-lg);
    border-radius: var(--radius-lg);
    text-align: center;
}

.owner-notice p,
.ended-notice p {
    margin: 0;
    color: var(--color-text-muted);
}

.no-bids {
    padding: var(--space-lg);
    text-align: center;
    color: var(--color-text-muted);
    background: var(--color-bg-alt);
    border-radius: var(--radius-md);
}

.no-bids p {
    margin: 0;
}

.bid-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.bid-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md);
    background: var(--color-white);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
}

.bid-item.winning {
    background: #f0fdf4;
    border-color: #bbf7d0;
}

.bid-item.is-you {
    border-color: var(--color-teal);
}

.bid-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.bidder-name {
    font-weight: 500;
    color: var(--color-navy);
}

.you-badge {
    color: var(--color-teal);
    font-size: 0.875rem;
}

.bid-time {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
}

.bid-item .bid-amount {
    font-family: var(--font-heading);
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-teal);
}

.bid-item.winning .bid-amount {
    color: #15803d;
}

@media (max-width: 640px) {
    .bid-form .form-row {
        flex-direction: column;
        align-items: stretch;
    }
    
    .bid-form .btn {
        width: 100%;
    }
}
</style>
