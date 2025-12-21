<script setup>
/**
 * DraftsView - Local Drafts Management (Extension 3)
 * Manages auction drafts saved to localStorage
 */

import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { draftService, itemService } from '@/services/api';
import { useAuth } from '@/stores/auth';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import ErrorAlert from '@/components/ErrorAlert.vue';
import EmptyState from '@/components/EmptyState.vue';

const router = useRouter();
const { isLoggedIn } = useAuth();

const drafts = ref([]);
const loading = ref(true);
const error = ref(null);
const publishing = ref(null); // ID of draft being published
const deleting = ref(null); // ID of draft being deleted

// Modal state
const showDeleteModal = ref(false);
const draftToDelete = ref(null);

function loadDrafts() {
    loading.value = true;
    error.value = null;
    
    try {
        drafts.value = draftService.getAll();
    } catch (err) {
        error.value = 'Failed to load drafts';
    } finally {
        loading.value = false;
    }
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function editDraft(draft) {
    // Navigate to create page with draft ID
    router.push({ 
        name: 'create', 
        query: { draft: draft.id } 
    });
}

function confirmDelete(draft) {
    draftToDelete.value = draft;
    showDeleteModal.value = true;
}

function cancelDelete() {
    draftToDelete.value = null;
    showDeleteModal.value = false;
}

function deleteDraft() {
    if (!draftToDelete.value) return;
    
    deleting.value = draftToDelete.value.id;
    
    try {
        draftService.delete(draftToDelete.value.id);
        drafts.value = drafts.value.filter(d => d.id !== draftToDelete.value.id);
    } catch (err) {
        error.value = 'Failed to delete draft';
    } finally {
        deleting.value = null;
        cancelDelete();
    }
}

async function publishDraft(draft) {
    if (!isLoggedIn.value) {
        router.push({ name: 'login', query: { redirect: '/drafts' } });
        return;
    }
    
    publishing.value = draft.id;
    error.value = null;
    
    try {
        // Create the item via API
        const newItem = await itemService.create({
            name: draft.name,
            description: draft.description,
            starting_bid: draft.starting_bid,
            end_date: draft.end_date
        });
        
        // Remove the draft
        draftService.delete(draft.id);
        drafts.value = drafts.value.filter(d => d.id !== draft.id);
        
        // Navigate to the new item
        router.push({ name: 'item', params: { id: newItem.item_id } });
    } catch (err) {
        error.value = err.message || 'Failed to publish auction';
    } finally {
        publishing.value = null;
    }
}

function clearAllDrafts() {
    if (confirm('Are you sure you want to delete all drafts? This cannot be undone.')) {
        draftService.clearAll();
        drafts.value = [];
    }
}

onMounted(loadDrafts);
</script>

<template>
    <div class="drafts-view page">
        <div class="container">
            <!-- Header -->
            <header class="drafts-header">
                <div class="header-content">
                    <h1>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="header-icon">
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        Saved Drafts
                    </h1>
                    <p>Auction listings you've saved locally for later</p>
                </div>
                
                <div class="header-actions">
                    <router-link to="/create" class="btn btn-primary">
                        <svg viewBox="0 0 20 20" fill="currentColor" class="btn-icon">
                            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                        </svg>
                        New Draft
                    </router-link>
                    <button 
                        v-if="drafts.length > 1"
                        @click="clearAllDrafts"
                        class="btn btn-ghost"
                    >
                        Clear All
                    </button>
                </div>
            </header>
            
            <LoadingSpinner v-if="loading" message="Loading drafts..." />
            
            <ErrorAlert 
                v-else-if="error" 
                :message="error"
                @dismiss="error = null"
            />
            
            <EmptyState 
                v-else-if="drafts.length === 0"
                title="No saved drafts"
                message="Create a new auction and save it as a draft to work on it later."
                icon="folder"
            >
                <template #action>
                    <router-link to="/create" class="btn btn-primary">
                        Create Auction
                    </router-link>
                </template>
            </EmptyState>
            
            <!-- Drafts List -->
            <div v-else class="drafts-list">
                <article 
                    v-for="draft in drafts" 
                    :key="draft.id"
                    class="draft-card card"
                >
                    <div class="draft-content">
                        <div class="draft-main">
                            <h3 class="draft-title">
                                {{ draft.name || 'Untitled Draft' }}
                            </h3>
                            <p class="draft-description">
                                {{ draft.description 
                                    ? (draft.description.length > 150 
                                        ? draft.description.slice(0, 150) + '...' 
                                        : draft.description)
                                    : 'No description' 
                                }}
                            </p>
                            <div class="draft-meta">
                                <span class="meta-item">
                                    <svg viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                                    </svg>
                                    Saved {{ formatDate(draft.updated_at) }}
                                </span>
                                <span v-if="draft.starting_bid" class="meta-item">
                                    <svg viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
                                    </svg>
                                    £{{ draft.starting_bid.toFixed(2) }}
                                </span>
                                <span v-if="draft.end_date" class="meta-item">
                                    <svg viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                                    </svg>
                                    Ends {{ formatDate(draft.end_date) }}
                                </span>
                            </div>
                        </div>
                        
                        <div class="draft-actions">
                            <button 
                                @click="publishDraft(draft)"
                                :disabled="publishing === draft.id || !draft.name || !draft.description || !draft.starting_bid || !draft.end_date"
                                class="btn btn-primary btn-sm"
                                :title="(!draft.name || !draft.description || !draft.starting_bid || !draft.end_date) ? 'Complete all fields before publishing' : 'Publish this auction'"
                            >
                                {{ publishing === draft.id ? 'Publishing...' : 'Publish' }}
                            </button>
                            <button 
                                @click="editDraft(draft)"
                                class="btn btn-outline btn-sm"
                            >
                                Edit
                            </button>
                            <button 
                                @click="confirmDelete(draft)"
                                :disabled="deleting === draft.id"
                                class="btn btn-ghost btn-sm btn-danger"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                    
                    <!-- Incomplete warning -->
                    <div 
                        v-if="!draft.name || !draft.description || !draft.starting_bid || !draft.end_date"
                        class="draft-warning"
                    >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        <span>
                            Missing: 
                            {{ [
                                !draft.name && 'title',
                                !draft.description && 'description',
                                !draft.starting_bid && 'starting bid',
                                !draft.end_date && 'end date'
                            ].filter(Boolean).join(', ') }}
                        </span>
                    </div>
                </article>
            </div>
            
            <!-- Delete Confirmation Modal -->
            <Teleport to="body">
                <div v-if="showDeleteModal" class="modal-overlay" @click.self="cancelDelete">
                    <div class="modal-content card">
                        <h2>Delete Draft?</h2>
                        <p>Are you sure you want to delete "{{ draftToDelete?.name || 'Untitled Draft' }}"? This action cannot be undone.</p>
                        <div class="modal-actions">
                            <button @click="cancelDelete" class="btn btn-outline">
                                Cancel
                            </button>
                            <button @click="deleteDraft" class="btn btn-primary btn-danger">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </Teleport>
        </div>
    </div>
</template>

<style scoped>
.drafts-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-xl);
    margin-bottom: var(--space-2xl);
    padding-bottom: var(--space-xl);
    border-bottom: 1px solid var(--color-border);
}

.header-content h1 {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-xs);
}

.header-icon {
    width: 28px;
    height: 28px;
    color: var(--color-teal);
}

.header-content p {
    color: var(--color-text-muted);
    margin: 0;
}

.header-actions {
    display: flex;
    gap: var(--space-sm);
    flex-shrink: 0;
}

.btn-icon {
    width: 16px;
    height: 16px;
    margin-right: var(--space-xs);
}

/* Drafts List */
.drafts-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.draft-card {
    padding: var(--space-lg);
}

.draft-content {
    display: flex;
    gap: var(--space-xl);
    align-items: flex-start;
}

.draft-main {
    flex: 1;
    min-width: 0;
}

.draft-title {
    font-size: 1.125rem;
    margin-bottom: var(--space-sm);
    color: var(--color-text);
}

.draft-description {
    color: var(--color-text-muted);
    font-size: 0.9375rem;
    margin-bottom: var(--space-md);
    line-height: 1.5;
}

.draft-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-md);
}

.meta-item {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-size: 0.8125rem;
    color: var(--color-text-muted);
}

.meta-item svg {
    width: 14px;
    height: 14px;
    opacity: 0.7;
}

.draft-actions {
    display: flex;
    gap: var(--space-sm);
    flex-shrink: 0;
}

.btn-sm {
    padding: var(--space-xs) var(--space-md);
    font-size: 0.875rem;
}

.btn-danger {
    color: var(--color-error);
}

.btn-danger:hover {
    background: var(--color-error);
    color: var(--color-white);
    border-color: var(--color-error);
}

/* Warning */
.draft-warning {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-top: var(--space-md);
    padding-top: var(--space-md);
    border-top: 1px solid var(--color-border);
    font-size: 0.8125rem;
    color: var(--color-amber);
}

.draft-warning svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
}

/* Modal */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--space-md);
}

.modal-content {
    max-width: 400px;
    width: 100%;
    padding: var(--space-xl);
    animation: slideUp 0.2s ease-out;
}

.modal-content h2 {
    font-size: 1.25rem;
    margin-bottom: var(--space-sm);
}

.modal-content p {
    color: var(--color-text-muted);
    margin-bottom: var(--space-xl);
}

.modal-actions {
    display: flex;
    gap: var(--space-sm);
    justify-content: flex-end;
}

/* Responsive */
@media (max-width: 768px) {
    .drafts-header {
        flex-direction: column;
    }
    
    .draft-content {
        flex-direction: column;
    }
    
    .draft-actions {
        width: 100%;
        margin-top: var(--space-md);
        padding-top: var(--space-md);
        border-top: 1px solid var(--color-border);
    }
    
    .draft-actions .btn {
        flex: 1;
    }
}
</style>
