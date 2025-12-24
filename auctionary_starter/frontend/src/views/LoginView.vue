<script setup>
/**
 * LoginView - User Login Page
 */

import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/stores/auth';
import ErrorAlert from '@/components/ErrorAlert.vue';

const router = useRouter();
const route = useRoute();
const { login, isLoading, authError, clearError } = useAuth();

const email = ref('');
const password = ref('');
const localError = ref(null);

const error = computed(() => localError.value || authError.value);

async function handleSubmit() {
    localError.value = null;
    clearError();
    
    // Basic validation
    if (!email.value.trim()) {
        localError.value = 'Please enter your email address';
        return;
    }
    
    if (!password.value) {
        localError.value = 'Please enter your password';
        return;
    }
    
    try {
        await login(email.value.trim(), password.value);
        
        // Redirect to intended page or home
        const redirectTo = route.query.redirect || '/';
        router.push(redirectTo);
    } catch (err) {
        // Error is handled by authError
    }
}
</script>

<template>
    <div class="auth-view page">
        <div class="container">
            <div class="auth-card card">
                <div class="auth-header">
                    <div class="auth-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                        </svg>
                    </div>
                    <h1>Welcome Back</h1>
                    <p>Sign in to your Elemental Exchange account</p>
                </div>
                
                <ErrorAlert 
                    v-if="error" 
                    :message="error" 
                    type="error"
                    @dismiss="localError = null; clearError()"
                />
                
                <form @submit.prevent="handleSubmit" class="auth-form">
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input
                            id="email"
                            v-model="email"
                            type="email"
                            placeholder="you@example.com"
                            autocomplete="email"
                            :disabled="isLoading"
                            required
                        />
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input
                            id="password"
                            v-model="password"
                            type="password"
                            placeholder="Your password"
                            autocomplete="current-password"
                            :disabled="isLoading"
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        class="btn btn-primary btn-lg submit-btn"
                        :disabled="isLoading"
                    >
                        {{ isLoading ? 'Signing in...' : 'Sign In' }}
                    </button>
                </form>
                
                <div class="auth-footer">
                    <p>
                        Don't have an account?
                        <router-link :to="{ name: 'register', query: route.query }">
                            Create one
                        </router-link>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.auth-view {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 200px);
}

.auth-card {
    max-width: 420px;
    margin: 0 auto;
    padding: var(--space-2xl);
}

.auth-header {
    text-align: center;
    margin-bottom: var(--space-xl);
}

.auth-icon {
    width: 56px;
    height: 56px;
    margin: 0 auto var(--space-md);
    color: var(--color-teal);
    background: rgba(13, 148, 136, 0.1);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
}

.auth-icon svg {
    width: 28px;
    height: 28px;
}

.auth-header h1 {
    font-size: 1.5rem;
    margin-bottom: var(--space-xs);
}

.auth-header p {
    color: var(--color-text-muted);
    margin: 0;
}

.auth-form .form-group {
    margin-bottom: var(--space-lg);
}

.submit-btn {
    width: 100%;
    margin-top: var(--space-sm);
}

.auth-footer {
    margin-top: var(--space-xl);
    padding-top: var(--space-lg);
    border-top: 1px solid var(--color-border);
    text-align: center;
}

.auth-footer p {
    margin: 0;
    color: var(--color-text-muted);
}

.auth-footer a {
    font-weight: 500;
}
</style>
