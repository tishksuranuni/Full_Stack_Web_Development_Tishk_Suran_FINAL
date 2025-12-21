<script setup>
/**
 * LoadingSpinner Component
 * Displays a loading indicator with optional message
 */

defineProps({
    message: {
        type: String,
        default: ''
    },
    size: {
        type: String,
        default: 'medium',
        validator: (v) => ['small', 'medium', 'large'].includes(v)
    },
    fullPage: {
        type: Boolean,
        default: false
    }
});
</script>

<template>
    <div class="loading-container" :class="{ 'full-page': fullPage }">
        <div class="spinner-wrapper">
            <!-- Chemistry-themed loading animation (molecule spinning) -->
            <svg 
                class="molecule-spinner" 
                :class="size"
                viewBox="0 0 50 50"
            >
                <!-- Central atom -->
                <circle cx="25" cy="25" r="5" fill="var(--color-teal)" class="center-atom"/>
                
                <!-- Orbiting electrons -->
                <g class="orbit orbit-1">
                    <circle cx="25" cy="8" r="3" fill="var(--color-amber)"/>
                </g>
                <g class="orbit orbit-2">
                    <circle cx="25" cy="8" r="3" fill="var(--color-navy)"/>
                </g>
                <g class="orbit orbit-3">
                    <circle cx="25" cy="8" r="3" fill="var(--color-teal-light)"/>
                </g>
            </svg>
            
            <p v-if="message" class="loading-message">{{ message }}</p>
        </div>
    </div>
</template>

<style scoped>
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--space-xl);
}

.loading-container.full-page {
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.9);
    z-index: 1000;
}

.spinner-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
}

.molecule-spinner {
    animation: pulse 2s ease-in-out infinite;
}

.molecule-spinner.small {
    width: 32px;
    height: 32px;
}

.molecule-spinner.medium {
    width: 48px;
    height: 48px;
}

.molecule-spinner.large {
    width: 64px;
    height: 64px;
}

.orbit {
    transform-origin: 25px 25px;
    animation: spin 1.5s linear infinite;
}

.orbit-1 {
    animation-duration: 1s;
}

.orbit-2 {
    animation-duration: 1.5s;
    animation-delay: 0.2s;
}

.orbit-3 {
    animation-duration: 2s;
    animation-delay: 0.4s;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
}

.loading-message {
    font-family: var(--font-heading);
    font-size: 0.9375rem;
    color: var(--color-text-muted);
    margin: 0;
}
</style>
