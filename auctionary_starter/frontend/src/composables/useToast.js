/**
 * Toast Notification Composable
 * Provides global toast notification functionality
 */

import { ref } from 'vue';

// Global toast state
export const toasts = ref([]);

let nextId = 0;

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type of toast: 'success', 'error', 'info', 'warning'
 * @param {number} duration - Duration in ms (0 = no auto-dismiss)
 */
function showToast(message, type = 'success', duration = 3000) {
    const id = nextId++;

    const toast = {
        id,
        message,
        type,
        duration,
        close: () => {
            const index = toasts.value.findIndex(t => t.id === id);
            if (index > -1) {
                toasts.value.splice(index, 1);
            }
        }
    };

    toasts.value.push(toast);

    return toast;
}

/**
 * Composable hook for toast notifications
 */
export function useToast() {
    return {
        toasts,
        showToast,
        success: (message, duration) => showToast(message, 'success', duration),
        error: (message, duration) => showToast(message, 'error', duration),
        info: (message, duration) => showToast(message, 'info', duration),
        warning: (message, duration) => showToast(message, 'warning', duration)
    };
}
