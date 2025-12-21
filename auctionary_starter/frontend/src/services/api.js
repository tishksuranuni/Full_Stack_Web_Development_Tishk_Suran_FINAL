const API_BASE_URL = 'http://localhost:3333';

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    const token = localStorage.getItem('session_token');

    if(token) {
        config.headers['X-Authorization'] = token;
    }

    try {
        const response = await fetch(url, config);

        // Return {}, instead of crashing. 
        const data = await response.json().catch(() => ({}));

        if(!response.ok) {
            throw {
                status: response.status,
                message: data.error_message || 'An error occurred :(',
                data
            };
        }

        return data;
    } catch (error) {
        if (error.status) {
            throw error;
        }

        throw {
            status: 0,
            message: 'Network error. .',
            data: {}
        };

    }
}

export const userService = {
    register(userData)
}