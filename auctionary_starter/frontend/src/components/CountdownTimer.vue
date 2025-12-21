<script setup>
/**
 * CountdownTimer Component
 * Displays remaining time until auction ends
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    endDate: {
        type: Number,
        required: true
    },
    compact: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['ended']);

const now = ref(Date.now());
let intervalId = null;

const timeRemaining = computed(() => {
    const diff = props.endDate - now.value;
    
    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, ended: false };
});

const isUrgent = computed(() => {
    // Less than 1 hour remaining
    return !timeRemaining.value.ended && 
           timeRemaining.value.days === 0 && 
           timeRemaining.value.hours === 0;
});

const displayText = computed(() => {
    const t = timeRemaining.value;
    
    if (t.ended) return 'Ended';
    
    if (t.days > 0) {
        return `${t.days}d ${t.hours}h`;
    }
    
    if (t.hours > 0) {
        return `${t.hours}h ${t.minutes}m`;
    }
    
    return `${t.minutes}m ${t.seconds}s`;
});

function pad(num) {
    return String(num).padStart(2, '0');
}

onMounted(() => {
    intervalId = setInterval(() => {
        now.value = Date.now();
        
        if (timeRemaining.value.ended) {
            clearInterval(intervalId);
            emit('ended');
        }
    }, 1000);
});

onUnmounted(() => {
    if (intervalId) {
        clearInterval(intervalId);
    }
});
</script>

<template>
    <div 
        class="countdown" 
        :class="{ 
            compact, 
            urgent: isUrgent, 
            ended: timeRemaining.ended 
        }"
    >
        <!-- Compact Mode -->
        <template v-if="compact">
            <span class="compact-label">{{ timeRemaining.ended ? 'Ended' : 'Ends in' }}</span>
            <span class="compact-time" v-if="!timeRemaining.ended">{{ displayText }}</span>
        </template>
        
        <!-- Full Mode -->
        <template v-else>
            <div v-if="timeRemaining.ended" class="ended-message">
                Auction has ended
            </div>
            <div v-else class="countdown-segments">
                <div v-if="timeRemaining.days > 0" class="segment">
                    <span class="value">{{ pad(timeRemaining.days) }}</span>
                    <span class="label">Days</span>
                </div>
                <div class="segment">
                    <span class="value">{{ pad(timeRemaining.hours) }}</span>
                    <span class="label">Hours</span>
                </div>
                <div class="segment">
                    <span class="value">{{ pad(timeRemaining.minutes) }}</span>
                    <span class="label">Mins</span>
                </div>
                <div class="segment">
                    <span class="value">{{ pad(timeRemaining.seconds) }}</span>
                    <span class="label">Secs</span>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
.countdown {
    font-family: var(--font-heading);
}

/* Compact Mode Styles */
.countdown.compact {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.compact-label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.compact-time {
    font-weight: 600;
    color: var(--color-navy);
}

.countdown.compact.urgent .compact-time {
    color: var(--color-amber);
}

/* Full Mode Styles */
.countdown-segments {
    display: flex;
    gap: var(--space-md);
}

.segment {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 56px;
    padding: var(--space-sm) var(--space-md);
    background: var(--color-bg-alt);
    border-radius: var(--radius-md);
}

.segment .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-navy);
    line-height: 1;
}

.segment .label {
    font-size: 0.6875rem;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 4px;
}

.countdown.urgent .segment {
    background: #fef3c7;
}

.countdown.urgent .segment .value {
    color: var(--color-amber-dark);
}

.ended-message {
    padding: var(--space-md);
    background: var(--color-bg-alt);
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    text-align: center;
}
</style>
