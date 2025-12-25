/**
 * API Service for Elemental Exchange
 * Handles all communication with the backend
 */

const API_BASE_URL = 'http://localhost:3333';

/**
 * Core request handler with auth token injection
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };
    
    // Inject auth token if present
    const token = localStorage.getItem('session_token');
    if (token) {
        config.headers['X-Authorization'] = token;
    }
    
    try {
        const response = await fetch(url, config);
        
        // Handle empty responses gracefully
        const data = await response.json().catch(() => ({}));
        
        if (!response.ok) {
            // Handle expired/invalid session
            if (response.status === 401) {
                // Clear session data
                localStorage.removeItem('session_token');
                localStorage.removeItem('user_id');

                // Redirect to login if not already there
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
                }
            }

            throw {
                status: response.status,
                message: data.error_message || 'An unexpected error occurred',
                data
            };
        }
        
        return data;
    } catch (error) {
        // Re-throw API errors as-is
        if (error.status) {
            throw error;
        }
        
        // Network/other errors
        throw {
            status: 0,
            message: 'Network error. Please check your connection.',
            data: {}
        };
    }
}

/**
 * User Management Endpoints
 */
export const userService = {
    /**
     * Register a new user
     * @param {Object} userData - { first_name, last_name, email, password }
     * @returns {Promise<{user_id: number}>}
     */
    async register(userData) {
        return apiRequest('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },
    
    /**
     * Get user profile with their auctions
     * @param {number} userId
     * @returns {Promise<Object>} User profile with selling, bidding_on, auctions_ended
     */
    async getProfile(userId) {
        return apiRequest(`/users/${userId}`);
    }
};

/**
 * Authentication Endpoints
 */
export const authService = {
    /**
     * Login user
     * @param {Object} credentials - { email, password }
     * @returns {Promise<{user_id: number, session_token: string}>}
     */
    async login(credentials) {
        const response = await apiRequest('/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        // Store auth data
        if (response.session_token) {
            localStorage.setItem('session_token', response.session_token);
            localStorage.setItem('user_id', response.user_id);
        }
        
        return response;
    },
    
    /**
     * Logout current user
     * @returns {Promise<Object>}
     */
    async logout() {
        try {
            await apiRequest('/logout', {
                method: 'POST'
            });
        } finally {
            // Clear local storage regardless of API response
            localStorage.removeItem('session_token');
            localStorage.removeItem('user_id');
        }
    },
    
    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    isLoggedIn() {
        return !!localStorage.getItem('session_token');
    },
    
    /**
     * Get current user ID
     * @returns {number|null}
     */
    getCurrentUserId() {
        const id = localStorage.getItem('user_id');
        return id ? parseInt(id, 10) : null;
    }
};

/**
 * Item/Auction Endpoints
 */
export const itemService = {
    /**
     * Create a new auction item
     * @param {Object} itemData - { name, description, starting_bid, end_date, categories? }
     * @returns {Promise<{item_id: number}>}
     */
    async create(itemData) {
        return apiRequest('/item', {
            method: 'POST',
            body: JSON.stringify(itemData)
        });
    },

    /**
     * Get item details
     * @param {number} itemId
     * @returns {Promise<Object>} Item details with current bid info
     */
    async getOne(itemId) {
        return apiRequest(`/item/${itemId}`);
    },

    /**
     * Search/filter items
     * @param {Object} params - { status?, q?, limit?, offset?, category? }
     *   status: 'OPEN' (my listings), 'BID' (my bids), 'ARCHIVE' (ended)
     *   category: category_id to filter by
     * @returns {Promise<Array>}
     */
    async search(params = {}) {
        const queryString = new URLSearchParams();

        if (params.status) queryString.append('status', params.status);
        if (params.q) queryString.append('q', params.q);
        if (params.limit) queryString.append('limit', params.limit);
        if (params.offset) queryString.append('offset', params.offset);
        if (params.category) queryString.append('category', params.category);

        const query = queryString.toString();
        return apiRequest(`/search${query ? '?' + query : ''}`);
    }
};

/**
 * Category Endpoints (Extension Task 2)
 */
export const categoryService = {
    /**
     * Get all available categories
     * @returns {Promise<Array>} Array of category objects
     */
    async getAll() {
        return apiRequest('/categories');
    }
};

/**
 * Bid Endpoints
 */
export const bidService = {
    /**
     * Place a bid on an item
     * @param {number} itemId
     * @param {number} amount
     * @returns {Promise<Object>}
     */
    async placeBid(itemId, amount) {
        return apiRequest(`/item/${itemId}/bid`, {
            method: 'POST',
            body: JSON.stringify({ amount })
        });
    },
    
    /**
     * Get bid history for an item
     * @param {number} itemId
     * @returns {Promise<Array>}
     */
    async getHistory(itemId) {
        return apiRequest(`/item/${itemId}/bid`);
    }
};

/**
 * Question Endpoints
 */
export const questionService = {
    /**
     * Ask a question about an item
     * @param {number} itemId
     * @param {string} questionText
     * @returns {Promise<{question_id: number}>}
     */
    async ask(itemId, questionText) {
        return apiRequest(`/item/${itemId}/question`, {
            method: 'POST',
            body: JSON.stringify({ question_text: questionText })
        });
    },
    
    /**
     * Get all questions for an item
     * @param {number} itemId
     * @returns {Promise<Array>}
     */
    async getByItem(itemId) {
        return apiRequest(`/item/${itemId}/question`);
    },
    
    /**
     * Answer a question (item owner only)
     * @param {number} questionId
     * @param {string} answerText
     * @returns {Promise<Object>}
     */
    async answer(questionId, answerText) {
        return apiRequest(`/question/${questionId}`, {
            method: 'POST',
            body: JSON.stringify({ answer_text: answerText })
        });
    }
};

/**
 * Draft Service (Local Storage - Extension Task 3)
 * Allows users to save item drafts before submitting
 */
export const draftService = {
    STORAGE_KEY: 'molecule_market_drafts',
    
    /**
     * Get all drafts
     * @returns {Array}
     */
    getAll() {
        const drafts = localStorage.getItem(this.STORAGE_KEY);
        return drafts ? JSON.parse(drafts) : [];
    },
    
    /**
     * Get a single draft by ID
     * @param {string} draftId
     * @returns {Object|null}
     */
    getOne(draftId) {
        const drafts = this.getAll();
        return drafts.find(d => d.id === draftId) || null;
    },
    
    /**
     * Save a new draft
     * @param {Object} draftData - { name, description, starting_bid, end_date }
     * @returns {Object} The saved draft with ID
     */
    save(draftData) {
        const drafts = this.getAll();
        const draft = {
            id: `draft_${Date.now()}`,
            ...draftData,
            created_at: Date.now(),
            updated_at: Date.now()
        };
        drafts.push(draft);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(drafts));
        return draft;
    },
    
    /**
     * Update an existing draft
     * @param {string} draftId
     * @param {Object} draftData
     * @returns {Object|null} Updated draft or null if not found
     */
    update(draftId, draftData) {
        const drafts = this.getAll();
        const index = drafts.findIndex(d => d.id === draftId);
        
        if (index === -1) return null;
        
        drafts[index] = {
            ...drafts[index],
            ...draftData,
            updated_at: Date.now()
        };
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(drafts));
        return drafts[index];
    },
    
    /**
     * Delete a draft
     * @param {string} draftId
     * @returns {boolean} Success status
     */
    delete(draftId) {
        const drafts = this.getAll();
        const filtered = drafts.filter(d => d.id !== draftId);
        
        if (filtered.length === drafts.length) return false;
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
        return true;
    },
    
    /**
     * Clear all drafts
     */
    clearAll() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
};
