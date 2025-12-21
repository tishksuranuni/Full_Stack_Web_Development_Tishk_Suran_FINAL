<script setup>
/**
 * RegisterView - User Registration Page
 */

import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/stores/auth';
import ErrorAlert from '@/components/ErrorAlert.vue';

const router = useRouter();
const route = useRoute();
const { register, login, isLoading, authError, clearError } = useAuth();

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const localError = ref(null);

const error = computed(() => localError.value || authError.value);

// Password validation requirements
const passwordRequirements = computed(() => {
    const pwd = password.value;
    return {
        length: pwd.length >= 8 && pwd.length <= 32,
        uppercase: /[A-Z]/.test(pwd),
        lowercase: /[a-z]/.test(pwd),
        number: /[0-9]/.test(pwd),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    };
});

const passwordValid = computed(() => {
    return Object.values(passwordRequirements.value).every(Boolean);
});

async function handleSubmit() {
    localError.value = null;
    clearError();
    
    // Validation
    if (!firstName.value.trim()) {
        localError.value = 'Please enter your first name';
        return;
    }
    
    if (!lastName.value.trim()) {
        localError.value = 'Please enter your last name';
        return;
    }
    
    if (!email.value.trim()) {
        localError.value = 'Please enter your email address';
        return;
    }
    
    if (!passwordValid.value) {
        localError.value = 'Password does not meet requirements';
        return;
    }
    
    if (password.value !== confirmPassword.value) {
        localError.value = 'Passwords do not match';
        return;
    }
    
    try {
        await register({
            first_name: firstName.value.trim(),
            last_name: lastName.value.trim(),
            email: email.value.trim(),
            password: password.value
        });
        
        // Auto-login after registration
        await login(email.value.trim(), password.value);
        
        // Redirect
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
                            <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                        </svg>
                    </div>
                    <h1>Create Account</h1>
                    <p>Join Molecule Market today</p>
                </div>
                
                <ErrorAlert 
                    v-if="error" 
                    :message="error" 
                    type="error"
                    @dismiss="localError = null; clearError()"
                />
                
                <form @submit.prevent="handleSubmit" class="auth-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="firstName">First Name</label>
                            <input
                                id="firstName"
                                v-model="firstName"
                                type="text"
                                placeholder="John"
                                autocomplete="given-name"
                                :disabled="isLoading"
                                required
                            />
                        </div>
                        
                        <div class="form-group">
                            <label for="lastName">Last Name</label>
                            <input
                                id="lastName"
                                v-model="lastName"
                                type="text"
                                placeholder="Dalton"
                                autocomplete="family-name"
                                :disabled="isLoading"
                                required
                            />
                        </div>
                    </div>
                    
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
                            placeholder="Create a strong password"
                            autocomplete="new-password"
                            :disabled="isLoading"
                            required
                        />
                        
                        <!-- Password requirements -->
                        <ul v-if="password" class="password-requirements">
                            <li :class="{ met: passwordRequirements.length }">
                                8-32 characters
                            </li>
                            <li :class="{ met: passwordRequirements.uppercase }">
                                One uppercase letter
                            </li>
                            <li :class="{ met: passwordRequirements.lowercase }">
                                One lowercase letter
                            </li>
                            <li :class="{ met: passwordRequirements.number }">
                                One number
                            </li>
                            <li :class="{ met: passwordRequirements.special }">
                                One special character
                            </li>
                        </ul>
                    </div>
                    
                    <div class="form-group">
                        <label for="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            v-model="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            autocomplete="new-password"
                            :disabled="isLoading"
                            required
                        />
                        <span 
                            v-if="confirmPassword && confirmPassword !== password" 
                            class="form-error"
                        >
                            Passwords do not match
                        </span>
                    </div>
                    
                    <button 
                        type="submit" 
                        class="btn btn-primary btn-lg submit-btn"
                        :disabled="isLoading || !passwordValid"
                    >
                        {{ isLoading ? 'Creating account...' : 'Create Account' }}
                    </button>
                </form>
                
                <div class="auth-footer">
                    <p>
                        Already have an account?
                        <router-link :to="{ name: 'login', query: route.query }">
                            Sign in
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
    padding: var(--space-xl) 0;
}

.auth-card {
    max-width: 480px;
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

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
}

.auth-form .form-group {
    margin-bottom: var(--space-lg);
}

.password-requirements {
    list-style: none;
    padding: 0;
    margin: var(--space-sm) 0 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-xs);
}

.password-requirements li {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    gap: var(--space-xs);
}

.password-requirements li::before {
    content: '○';
    font-size: 0.625rem;
}

.password-requirements li.met {
    color: var(--color-success);
}

.password-requirements li.met::before {
    content: '●';
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

@media (max-width: 480px) {
    .form-row {
        grid-template-columns: 1fr;
    }
    
    .password-requirements {
        grid-template-columns: 1fr;
    }
}
</style>
