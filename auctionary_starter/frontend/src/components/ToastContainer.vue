<script setup>
/**
 * ToastContainer Component
 * Container for displaying toast notifications
 */

import { toasts } from '@/composables/useToast';
import ToastNotification from './ToastNotification.vue';
</script>

<template>
    <div class="toast-container">
        <ToastNotification
            v-for="toast in toasts"
            :key="toast.id"
            :message="toast.message"
            :type="toast.type"
            :duration="toast.duration"
            @close="toast.close()"
        />
    </div>
</template>

<style scoped>
.toast-container {
    position: fixed;
    bottom: var(--space-xl);
    right: var(--space-xl);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    pointer-events: none;
}

.toast-container > * {
    pointer-events: auto;
}

@media (max-width: 640px) {
    .toast-container {
        bottom: var(--space-md);
        right: var(--space-md);
        left: var(--space-md);
    }
}
</style>
