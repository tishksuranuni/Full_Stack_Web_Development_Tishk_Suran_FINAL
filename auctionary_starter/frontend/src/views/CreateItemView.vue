<script setup>
/**
 * CreateItemView - Create New Auction
 * Supports saving drafts (Extension 3)
 */

import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { itemService, draftService, categoryService } from '@/services/api';
import ErrorAlert from '@/components/ErrorAlert.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const router = useRouter();
const route = useRoute();

// Form state
const name = ref('');
const description = ref('');
const startingBid = ref('');
const endDate = ref('');
const endTime = ref('');
const selectedCategories = ref([]);

// Categories
const categories = ref([]);
const categoriesLoading = ref(false);

// UI state
const loading = ref(false);
const saving = ref(false);
const error = ref(null);
const success = ref(null);
const editingDraftId = ref(null);

// Get minimum date (today)
const minDate = computed(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
});

// Get minimum datetime as ISO string
const getEndDateTime = computed(() => {
    if (!endDate.value || !endTime.value) return null;
    return new Date(`${endDate.value}T${endTime.value}`).getTime();
});

// Validation
const isValid = computed(() => {
    return (
        name.value.trim().length > 0 &&
        description.value.trim().length > 0 &&
        parseInt(startingBid.value, 10) >= 1 &&
        getEndDateTime.value &&
        getEndDateTime.value > Date.now()
    );
});

// Load categories and draft if editing
onMounted(async () => {
    // Load categories
    categoriesLoading.value = true;
    try {
        categories.value = await categoryService.getAll();
    } catch (err) {
        console.error('Failed to load categories:', err);
    } finally {
        categoriesLoading.value = false;
    }

    const draftId = route.query.draft;
    if (draftId) {
        const draft = draftService.getOne(draftId);
        if (draft) {
            editingDraftId.value = draftId;
            name.value = draft.name || '';
            description.value = draft.description || '';
            startingBid.value = draft.starting_bid?.toString() || '';
            selectedCategories.value = draft.categories || [];

            if (draft.end_date) {
                const date = new Date(draft.end_date);
                endDate.value = date.toISOString().split('T')[0];
                endTime.value = date.toTimeString().slice(0, 5);
            }
        }
    }

    // Set default end time to tomorrow
    if (!endDate.value) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 7); // Default: 1 week from now
        endDate.value = tomorrow.toISOString().split('T')[0];
        endTime.value = '18:00';
    }
});

// Toggle category selection
function toggleCategory(categoryId) {
    const index = selectedCategories.value.indexOf(categoryId);
    if (index > -1) {
        selectedCategories.value.splice(index, 1);
    } else {
        selectedCategories.value.push(categoryId);
    }
}

// Submit auction
async function handleSubmit() {
    error.value = null;

    if (!isValid.value) {
        error.value = 'Please fill in all fields correctly';
        return;
    }

    loading.value = true;

    try {
        const itemData = {
            name: name.value.trim(),
            description: description.value.trim(),
            starting_bid: parseInt(startingBid.value, 10),
            end_date: getEndDateTime.value
        };

        // Add categories if selected
        if (selectedCategories.value.length > 0) {
            itemData.categories = selectedCategories.value;
        }

        const response = await itemService.create(itemData);

        // Delete draft if we were editing one
        if (editingDraftId.value) {
            draftService.delete(editingDraftId.value);
        }

        // Navigate to the new item
        router.push(`/item/${response.item_id}`);
    } catch (err) {
        error.value = err.message || 'Failed to create auction';
        loading.value = false;
    }
}

// Save as draft
function saveDraft() {
    saving.value = true;
    error.value = null;
    success.value = null;

    const draftData = {
        name: name.value.trim(),
        description: description.value.trim(),
        starting_bid: startingBid.value ? parseInt(startingBid.value, 10) : null,
        end_date: getEndDateTime.value,
        categories: selectedCategories.value
    };

    try {
        if (editingDraftId.value) {
            draftService.update(editingDraftId.value, draftData);
            success.value = 'Draft updated successfully';
        } else {
            const draft = draftService.save(draftData);
            editingDraftId.value = draft.id;
            success.value = 'Draft saved successfully';
        }

        // Clear success after 3 seconds
        setTimeout(() => {
            success.value = null;
        }, 3000);
    } catch (err) {
        error.value = 'Failed to save draft';
    } finally {
        saving.value = false;
    }
}

// Discard draft
function discardDraft() {
    if (editingDraftId.value) {
        if (confirm('Are you sure you want to discard this draft?')) {
            draftService.delete(editingDraftId.value);
            router.push('/drafts');
        }
    } else {
        if (confirm('Clear all entered information?')) {
            name.value = '';
            description.value = '';
            startingBid.value = '';
            selectedCategories.value = [];
            // Keep default end date
        }
    }
}

// Format currency for display
function formatCurrency(value) {
    const num = parseInt(value, 10);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0
    }).format(num);
}
</script>

<template>
    <div class="create-view page">
        <div class="container">
            <div class="create-card card">
                <!-- Header -->
                <header class="create-header">
                    <div class="header-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                    </div>
                    <div>
                        <h1>{{ editingDraftId ? 'Edit Draft' : 'Create Auction' }}</h1>
                        <p>List your elements for auction on Elemental Exchange</p>
                    </div>
                </header>
                
                <!-- Alerts -->
                <ErrorAlert 
                    v-if="error" 
                    :message="error" 
                    type="error"
                    @dismiss="error = null"
                />
                
                <div v-if="success" class="alert alert-success">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4"/>
                        <circle cx="12" cy="12" r="10"/>
                    </svg>
                    {{ success }}
                </div>
                
                <!-- Form -->
                <form @submit.prevent="handleSubmit" class="create-form">
                    <!-- Name -->
                    <div class="form-group">
                        <label for="name">
                            Item Name
                            <span class="required">*</span>
                        </label>
                        <input
                            id="name"
                            v-model="name"
                            type="text"
                            placeholder="e.g., Plutonium (1g, lightly used)"
                            maxlength="100"
                            :disabled="loading"
                            required
                        />
                    </div>
                    
                    <!-- Description -->
                    <div class="form-group">
                        <label for="description">
                            Description
                            <span class="required">*</span>
                        </label>
                        <textarea
                            id="description"
                            v-model="description"
                            placeholder="Describe the element, its properties, and its uses..."
                            rows="5"
                            :disabled="loading"
                            required
                        ></textarea>
                    </div>

                    <!-- Categories -->
                    <div class="form-group">
                        <label>
                            Categories
                            <span class="optional">(optional)</span>
                        </label>
                        <div v-if="categoriesLoading" class="categories-loading">
                            <LoadingSpinner size="sm" />
                            Loading categories...
                        </div>
                        <div v-else class="categories-grid">
                            <button
                                v-for="category in categories"
                                :key="category.category_id"
                                type="button"
                                :class="['category-btn', { selected: selectedCategories.includes(category.category_id) }]"
                                @click="toggleCategory(category.category_id)"
                                :disabled="loading"
                            >
                                {{ category.name }}
                            </button>
                        </div>
                    </div>

                    <!-- Starting Bid & End Date Row -->
                    <div class="form-row">
                        <!-- Starting Bid -->
                        <div class="form-group">
                            <label for="startingBid">
                                Starting Bid
                                <span class="required">*</span>
                            </label>
                            <div class="input-with-prefix">
                                <span class="input-prefix">£</span>
                                <input
                                    id="startingBid"
                                    v-model="startingBid"
                                    type="number"
                                    placeholder="100"
                                    min="1"
                                    step="1"
                                    :disabled="loading"
                                    required
                                />
                            </div>
                            <span v-if="startingBid" class="form-hint">
                                {{ formatCurrency(startingBid) }}
                            </span>
                        </div>
                        
                        <!-- End Date -->
                        <div class="form-group">
                            <label for="endDate">
                                End Date
                                <span class="required">*</span>
                            </label>
                            <input
                                id="endDate"
                                v-model="endDate"
                                type="date"
                                :min="minDate"
                                :disabled="loading"
                                required
                            />
                        </div>
                        
                        <!-- End Time -->
                        <div class="form-group">
                            <label for="endTime">
                                End Time
                                <span class="required">*</span>
                            </label>
                            <input
                                id="endTime"
                                v-model="endTime"
                                type="time"
                                :disabled="loading"
                                required
                            />
                        </div>
                    </div>
                    
                    <!-- Preview -->
                    <div v-if="name || description || startingBid" class="preview-section">
                        <h3>Preview</h3>
                        <div class="preview-card">
                            <div class="preview-badge">
                                {{ (name || 'IT').substring(0, 2).toUpperCase() }}
                            </div>
                            <div class="preview-content">
                                <div class="preview-name">{{ name || 'Item Name' }}</div>
                                <div class="preview-bid">
                                    Starting at {{ startingBid ? formatCurrency(startingBid) : '£0' }}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div class="form-actions">
                        <div class="secondary-actions">
                            <button 
                                type="button"
                                class="btn btn-outline"
                                @click="saveDraft"
                                :disabled="loading || saving || (!name && !description)"
                            >
                                <svg v-if="saving" class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                                </svg>
                                {{ saving ? 'Saving...' : (editingDraftId ? 'Update Draft' : 'Save Draft') }}
                            </button>
                            <button 
                                type="button"
                                class="btn btn-ghost"
                                @click="discardDraft"
                                :disabled="loading"
                            >
                                {{ editingDraftId ? 'Discard Draft' : 'Clear' }}
                            </button>
                        </div>
                        
                        <button 
                            type="submit"
                            class="btn btn-primary btn-lg"
                            :disabled="loading || !isValid"
                        >
                            <LoadingSpinner v-if="loading" size="sm" />
                            {{ loading ? 'Creating...' : 'Create Auction' }}
                        </button>
                    </div>
                </form>
                
                <!-- Drafts Link -->
                <div class="drafts-link">
                    <router-link to="/drafts">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                        </svg>
                        View saved drafts
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.create-view {
    padding: var(--space-xl) 0;
}

.create-card {
    max-width: 680px;
    margin: 0 auto;
    padding: var(--space-2xl);
}

/* Header */
.create-header {
    display: flex;
    align-items: flex-start;
    gap: var(--space-lg);
    margin-bottom: var(--space-xl);
}

.header-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, var(--color-navy), var(--color-teal));
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.header-icon svg {
    width: 28px;
    height: 28px;
    color: white;
}

.create-header h1 {
    font-size: 1.5rem;
    margin: 0 0 var(--space-xs);
}

.create-header p {
    color: var(--color-text-muted);
    margin: 0;
}

/* Alerts */
.alert-success {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-lg);
    background: rgba(16, 185, 129, 0.1);
    color: var(--color-success);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-lg);
}

.alert-success svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
}

/* Form */
.create-form .form-group {
    margin-bottom: var(--space-lg);
}

.form-group label {
    display: block;
    font-weight: 500;
    margin-bottom: var(--space-sm);
}

.required {
    color: var(--color-error);
}

.optional {
    color: var(--color-text-muted);
    font-weight: 400;
    font-size: 0.875rem;
}

.form-hint {
    display: block;
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    margin-top: var(--space-xs);
}

/* Categories */
.categories-loading {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md);
    color: var(--color-text-muted);
    font-size: 0.875rem;
}

.categories-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
}

.category-btn {
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--color-border);
    background: white;
    color: var(--color-text);
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: all 0.2s ease;
}

.category-btn:hover:not(:disabled) {
    border-color: var(--color-navy);
    background: var(--color-slate-50);
}

.category-btn.selected {
    background: var(--color-navy);
    border-color: var(--color-navy);
    color: white;
}

.category-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--space-md);
}

/* Input with prefix */
.input-with-prefix {
    display: flex;
    align-items: stretch;
}

.input-prefix {
    display: flex;
    align-items: center;
    padding: 0 var(--space-md);
    background: var(--color-slate-100);
    border: 1px solid var(--color-border);
    border-right: none;
    border-radius: var(--radius-md) 0 0 var(--radius-md);
    font-weight: 500;
    color: var(--color-text-muted);
}

.input-with-prefix input {
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
    flex: 1;
}

/* Preview */
.preview-section {
    margin: var(--space-xl) 0;
    padding-top: var(--space-xl);
    border-top: 1px solid var(--color-border);
}

.preview-section h3 {
    font-size: 0.9375rem;
    color: var(--color-text-muted);
    margin: 0 0 var(--space-md);
}

.preview-card {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-lg);
    background: var(--color-slate-50);
    border-radius: var(--radius-md);
}

.preview-badge {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--color-navy), var(--color-teal));
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 1rem;
}

.preview-name {
    font-weight: 600;
    color: var(--color-navy);
}

.preview-bid {
    font-size: 0.875rem;
    color: var(--color-text-muted);
}

/* Actions */
.form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-md);
    margin-top: var(--space-xl);
    padding-top: var(--space-xl);
    border-top: 1px solid var(--color-border);
}

.secondary-actions {
    display: flex;
    gap: var(--space-sm);
}

.spinner {
    width: 16px;
    height: 16px;
    margin-right: var(--space-xs);
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Drafts Link */
.drafts-link {
    text-align: center;
    margin-top: var(--space-xl);
    padding-top: var(--space-lg);
    border-top: 1px solid var(--color-border);
}

.drafts-link a {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: 0.9375rem;
    color: var(--color-text-muted);
}

.drafts-link a:hover {
    color: var(--color-teal);
}

.drafts-link svg {
    width: 18px;
    height: 18px;
}

/* Responsive */
@media (max-width: 640px) {
    .create-card {
        padding: var(--space-lg);
    }
    
    .form-row {
        grid-template-columns: 1fr;
    }
    
    .form-actions {
        flex-direction: column-reverse;
    }
    
    .form-actions .btn-primary {
        width: 100%;
    }
    
    .secondary-actions {
        width: 100%;
        justify-content: center;
    }
}
</style>
