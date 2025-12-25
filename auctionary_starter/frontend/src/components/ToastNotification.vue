<script setup>
/**
 * ToastNotification Component
 * Displays toast notifications for success, error, info, and warning messages
 */

import { ref, onMounted } from 'vue';

const props = defineProps({
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'success',
        validator: (v) => ['success', 'error', 'info', 'warning'].includes(v)
    },
    duration: {
        type: Number,
        default: 3000
    }
});

const emit = defineEmits(['close']);

const isVisible = ref(false);

onMounted(() => {
    // Trigger animation
    setTimeout(() => {
        isVisible.value = true;
    }, 10);

    // Auto-dismiss
    if (props.duration > 0) {
        setTimeout(() => {
            close();
        }, props.duration);
    }
});

function close() {
    isVisible.value = false;
    setTimeout(() => {
        emit('close');
    }, 300); // Wait for animation
}
</script>

<template>
    <div
        class="toast"
        :class="[`toast-${type}`, { visible: isVisible }]"
        role="alert"
        aria-live="polite"
    >
        <div class="toast-icon">
            <!-- Success icon -->
            <svg v-if="type === 'success'" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>

            <!-- Error icon -->
            <svg v-else-if="type === 'error'" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>

            <!-- Warning icon -->
            <svg v-else-if="type === 'warning'" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>

            <!-- Info icon -->
            <svg v-else viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
        </div>

        <p class="toast-message">{{ message }}</p>

        <button
            @click="close"
            class="toast-close"
            aria-label="Close notification"
        >
            <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
        </button>
    </div>
</template>

<style scoped>
.toast {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    min-width: 300px;
    max-width: 500px;
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--radius-lg);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                0 4px 6px -2px rgba(0, 0, 0, 0.05),
                0 0 0 1px rgba(0, 0, 0, 0.05);
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast.visible {
    transform: translateY(0);
    opacity: 1;
}

.toast-success {
    background: #f0fdf4;
    color: #15803d;
    border-left: 4px solid #10b981;
}

.toast-error {
    background: #fef2f2;
    color: #b91c1c;
    border-left: 4px solid #ef4444;
}

.toast-warning {
    background: #fffbeb;
    color: #b45309;
    border-left: 4px solid #f59e0b;
}

.toast-info {
    background: #f0fdfa;
    color: #0f766e;
    border-left: 4px solid #14b8a6;
}

.toast-icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
}

.toast-icon svg {
    width: 100%;
    height: 100%;
}

.toast-message {
    flex: 1;
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 500;
    line-height: 1.5;
}

.toast-close {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity var(--transition-fast);
}

.toast-close:hover {
    opacity: 1;
}

.toast-close svg {
    width: 100%;
    height: 100%;
}
</style>
