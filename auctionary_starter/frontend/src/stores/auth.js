/**
 * Auth Store
 * Manages authentication state using Vue's reactivity system
 */

import { reactive, computed } from 'vue';
import { authService, userService } from '@/services/api';

// Reactive state
const state = reactive({
    userId: authService.getCurrentUserId(),
    sessionToken: localStorage.getItem('session_token'),
    user: null,
    loading: false,
    error: null
});

// Computed getters
export const isLoggedIn = computed(() => !!state.sessionToken);
export const currentUserId = computed(() => state.userId);
export const currentUser = computed(() => state.user);
export const isLoading = computed(() => state.loading);
export const authError = computed(() => state.error);

/**
 * Login user and update state
 * @param {string} email
 * @param {string} password
 */
export async function login(email, password) {
    state.loading = true;
    state.error = null;
    
    try {
        const response = await authService.login({ email, password });
        state.userId = response.user_id;
        state.sessionToken = response.session_token;
        
        // Fetch user profile after login
        await fetchUserProfile();
        
        return response;
    } catch (error) {
        state.error = error.message;
        throw error;
    } finally {
        state.loading = false;
    }
}

/**
 * Register new user
 * @param {Object} userData - { first_name, last_name, email, password }
 */
export async function register(userData) {
    state.loading = true;
    state.error = null;
    
    try {
        const response = await userService.register(userData);
        return response;
    } catch (error) {
        state.error = error.message;
        throw error;
    } finally {
        state.loading = false;
    }
}

/**
 * Logout user and clear state
 */
export async function logout() {
    state.loading = true;
    
    try {
        await authService.logout();
    } catch (error) {
        // Ignore logout errors, still clear state
        console.warn('Logout error:', error);
    } finally {
        state.userId = null;
        state.sessionToken = null;
        state.user = null;
        state.loading = false;
        state.error = null;
    }
}

/**
 * Fetch current user's profile
 */
export async function fetchUserProfile() {
    if (!state.userId) return null;
    
    try {
        const profile = await userService.getProfile(state.userId);
        state.user = profile;
        return profile;
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        return null;
    }
}

/**
 * Initialize auth state from localStorage
 * Call this on app startup
 */
export function initAuth() {
    const token = localStorage.getItem('session_token');
    const userId = localStorage.getItem('user_id');
    
    if (token && userId) {
        state.sessionToken = token;
        state.userId = parseInt(userId, 10);
        fetchUserProfile();
    }
}

/**
 * Clear any auth errors
 */
export function clearError() {
    state.error = null;
}

// Export as a composable
export function useAuth() {
    return {
        isLoggedIn,
        currentUserId,
        currentUser,
        isLoading,
        authError,
        login,
        register,
        logout,
        fetchUserProfile,
        initAuth,
        clearError
    };
}
