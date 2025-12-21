<script setup>
/**
 * EmptyState Component
 * Displays a friendly message when no content is available
 */

defineProps({
    title: {
        type: String,
        default: 'Nothing here yet'
    },
    message: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: 'beaker',
        validator: (v) => ['beaker', 'search', 'folder', 'bid'].includes(v)
    }
});
</script>

<template>
    <div class="empty-state">
        <div class="empty-icon">
            <!-- Beaker icon (default) -->
            <svg v-if="icon === 'beaker'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 8V24L12 48C10.5 51 12.5 54 16 54H48C51.5 54 53.5 51 52 48L40 24V8" 
                      stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M20 8H44" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M16 40H48" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
                <circle cx="24" cy="46" r="3" fill="var(--color-amber)" opacity="0.8"/>
                <circle cx="36" cy="44" r="4" fill="var(--color-teal)" opacity="0.6"/>
                <circle cx="44" cy="48" r="2" fill="var(--color-amber)" opacity="0.7"/>
            </svg>
            
            <!-- Search icon -->
            <svg v-else-if="icon === 'search'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="28" cy="28" r="16" stroke="currentColor" stroke-width="2.5"/>
                <path d="M40 40L52 52" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M28 20V28H36" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
            </svg>
            
            <!-- Folder icon -->
            <svg v-else-if="icon === 'folder'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 18C8 15.8 9.8 14 12 14H24L28 20H52C54.2 20 56 21.8 56 24V48C56 50.2 54.2 52 52 52H12C9.8 52 8 50.2 8 48V18Z" 
                      stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
                <path d="M24 36H40" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
            </svg>
            
            <!-- Bid icon -->
            <svg v-else-if="icon === 'bid'" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="20" stroke="currentColor" stroke-width="2.5"/>
                <path d="M32 20V32L40 40" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="32" cy="32" r="3" fill="var(--color-amber)"/>
            </svg>
        </div>
        
        <h3 class="empty-title">{{ title }}</h3>
        <p v-if="message" class="empty-message">{{ message }}</p>
        
        <div v-if="$slots.action" class="empty-action">
            <slot name="action" />
        </div>
    </div>
</template>

<style scoped>
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--space-3xl) var(--space-xl);
}

.empty-icon {
    width: 80px;
    height: 80px;
    color: var(--color-slate-light);
    margin-bottom: var(--space-lg);
}

.empty-icon svg {
    width: 100%;
    height: 100%;
}

.empty-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-navy);
    margin-bottom: var(--space-sm);
}

.empty-message {
    font-size: 0.9375rem;
    color: var(--color-text-muted);
    max-width: 300px;
    margin: 0;
}

.empty-action {
    margin-top: var(--space-lg);
}
</style>
