<script setup>
/**
 * QuestionSection Component
 * Handles asking questions and displaying Q&A for an item
 */

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { questionService } from '@/services/api';
import { useAuth } from '@/stores/auth';
import LoadingSpinner from './LoadingSpinner.vue';
import ErrorAlert from './ErrorAlert.vue';

const props = defineProps({
    itemId: {
        type: Number,
        required: true
    },
    isOwner: {
        type: Boolean,
        default: false
    }
});

const router = useRouter();
const { isLoggedIn } = useAuth();

// Questions state
const questions = ref([]);
const loading = ref(true);
const error = ref(null);

// Ask question form state
const newQuestion = ref('');
const askSubmitting = ref(false);
const askError = ref(null);
const askSuccess = ref(false);

// Answer form state
const answeringId = ref(null);
const answerText = ref('');
const answerSubmitting = ref(false);
const answerError = ref(null);

async function loadQuestions() {
    loading.value = true;
    error.value = null;
    
    try {
        questions.value = await questionService.getByItem(props.itemId);
    } catch (err) {
        error.value = err.message;
    } finally {
        loading.value = false;
    }
}

async function handleAskQuestion() {
    if (!isLoggedIn.value) {
        router.push({ name: 'login', query: { redirect: `/item/${props.itemId}` } });
        return;
    }
    
    if (!newQuestion.value.trim()) {
        askError.value = 'Please enter a question';
        return;
    }
    
    askSubmitting.value = true;
    askError.value = null;
    askSuccess.value = false;
    
    try {
        await questionService.ask(props.itemId, newQuestion.value.trim());
        askSuccess.value = true;
        newQuestion.value = '';
        await loadQuestions();
        
        setTimeout(() => {
            askSuccess.value = false;
        }, 3000);
    } catch (err) {
        askError.value = err.message;
    } finally {
        askSubmitting.value = false;
    }
}

function startAnswering(questionId) {
    answeringId.value = questionId;
    answerText.value = '';
    answerError.value = null;
}

function cancelAnswering() {
    answeringId.value = null;
    answerText.value = '';
    answerError.value = null;
}

async function handleAnswer(questionId) {
    if (!answerText.value.trim()) {
        answerError.value = 'Please enter an answer';
        return;
    }
    
    answerSubmitting.value = true;
    answerError.value = null;
    
    try {
        await questionService.answer(questionId, answerText.value.trim());
        answeringId.value = null;
        answerText.value = '';
        await loadQuestions();
    } catch (err) {
        answerError.value = err.message;
    } finally {
        answerSubmitting.value = false;
    }
}

onMounted(loadQuestions);
</script>

<template>
    <div class="question-section">
        <h3 class="section-title">Questions & Answers</h3>
        
        <!-- Ask Question Form (for non-owners) -->
        <div v-if="!isOwner" class="ask-form-container">
            <ErrorAlert 
                v-if="askError" 
                :message="askError" 
                type="error"
                @dismiss="askError = null"
            />
            
            <div v-if="askSuccess" class="alert alert-success">
                Question submitted successfully!
            </div>
            
            <form @submit.prevent="handleAskQuestion" class="ask-form">
                <div class="form-group">
                    <label for="newQuestion">Ask a question</label>
                    <textarea
                        id="newQuestion"
                        v-model="newQuestion"
                        rows="3"
                        placeholder="What would you like to know about this item?"
                        :disabled="askSubmitting"
                    ></textarea>
                </div>
                
                <div class="form-actions">
                    <button 
                        type="submit" 
                        class="btn btn-primary"
                        :disabled="askSubmitting || !newQuestion.trim()"
                    >
                        {{ askSubmitting ? 'Submitting...' : 'Ask Question' }}
                    </button>
                </div>
            </form>
            
            <p v-if="!isLoggedIn" class="login-prompt">
                <router-link :to="{ name: 'login', query: { redirect: `/item/${itemId}` } }">
                    Log in
                </router-link>
                to ask a question
            </p>
        </div>
        
        <!-- Questions List -->
        <div class="questions-list">
            <LoadingSpinner v-if="loading" size="small" />
            
            <ErrorAlert 
                v-else-if="error" 
                :message="error"
                @retry="loadQuestions"
            />
            
            <div v-else-if="questions.length === 0" class="no-questions">
                <p>No questions yet. {{ isOwner ? '' : 'Be the first to ask!' }}</p>
            </div>
            
            <div v-else class="questions">
                <div 
                    v-for="question in questions" 
                    :key="question.question_id"
                    class="question-card"
                >
                    <!-- Question -->
                    <div class="question">
                        <div class="question-badge">Q</div>
                        <div class="question-content">
                            <p class="question-text">{{ question.question_text }}</p>
                        </div>
                    </div>
                    
                    <!-- Answer -->
                    <div v-if="question.answer_text" class="answer">
                        <div class="answer-badge">A</div>
                        <div class="answer-content">
                            <p class="answer-text">{{ question.answer_text }}</p>
                            <span class="seller-tag">Seller's response</span>
                        </div>
                    </div>
                    
                    <!-- Answer Form (for owner) -->
                    <div v-else-if="isOwner" class="answer-section">
                        <div v-if="answeringId === question.question_id" class="answer-form">
                            <ErrorAlert 
                                v-if="answerError" 
                                :message="answerError" 
                                type="error"
                                @dismiss="answerError = null"
                            />
                            
                            <div class="form-group">
                                <textarea
                                    v-model="answerText"
                                    rows="3"
                                    placeholder="Write your answer..."
                                    :disabled="answerSubmitting"
                                ></textarea>
                            </div>
                            
                            <div class="form-actions">
                                <button 
                                    @click="handleAnswer(question.question_id)"
                                    class="btn btn-primary btn-sm"
                                    :disabled="answerSubmitting || !answerText.trim()"
                                >
                                    {{ answerSubmitting ? 'Submitting...' : 'Submit Answer' }}
                                </button>
                                <button 
                                    @click="cancelAnswering"
                                    class="btn btn-ghost btn-sm"
                                    :disabled="answerSubmitting"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                        
                        <button 
                            v-else
                            @click="startAnswering(question.question_id)"
                            class="btn btn-outline btn-sm"
                        >
                            Answer this question
                        </button>
                    </div>
                    
                    <!-- Unanswered notice -->
                    <div v-else class="unanswered">
                        <span>Awaiting seller's response</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.question-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
}

.section-title {
    font-size: 1.125rem;
    margin-bottom: 0;
}

.ask-form-container {
    background: var(--color-bg-alt);
    padding: var(--space-lg);
    border-radius: var(--radius-lg);
}

.ask-form .form-group {
    margin-bottom: var(--space-md);
}

.ask-form textarea {
    resize: vertical;
    min-height: 80px;
}

.form-actions {
    display: flex;
    gap: var(--space-sm);
}

.login-prompt {
    margin-top: var(--space-md);
    font-size: 0.9375rem;
    color: var(--color-text-muted);
}

.no-questions {
    padding: var(--space-lg);
    text-align: center;
    color: var(--color-text-muted);
    background: var(--color-bg-alt);
    border-radius: var(--radius-md);
}

.no-questions p {
    margin: 0;
}

.questions {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.question-card {
    background: var(--color-white);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
}

.question,
.answer {
    display: flex;
    gap: var(--space-md);
}

.answer {
    margin-top: var(--space-md);
    padding-top: var(--space-md);
    border-top: 1px solid var(--color-border);
}

.question-badge,
.answer-badge {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    font-family: var(--font-heading);
    font-weight: 600;
    font-size: 0.875rem;
}

.question-badge {
    background: var(--color-teal);
    color: var(--color-white);
}

.answer-badge {
    background: var(--color-amber);
    color: var(--color-navy);
}

.question-content,
.answer-content {
    flex: 1;
    min-width: 0;
}

.question-text,
.answer-text {
    margin: 0;
    line-height: 1.6;
}

.seller-tag {
    display: inline-block;
    margin-top: var(--space-sm);
    font-size: 0.75rem;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.answer-section {
    margin-top: var(--space-md);
    padding-top: var(--space-md);
    border-top: 1px solid var(--color-border);
}

.answer-form {
    margin-bottom: var(--space-sm);
}

.answer-form textarea {
    resize: vertical;
    min-height: 60px;
}

.unanswered {
    margin-top: var(--space-md);
    padding-top: var(--space-md);
    border-top: 1px solid var(--color-border);
}

.unanswered span {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    font-style: italic;
}
</style>
