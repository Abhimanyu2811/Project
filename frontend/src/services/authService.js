// Use HTTP for local development since we're dealing with self-signed certificates
const API_URL = 'http://localhost:7197/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const errorMessage = error.message || `HTTP error! status: ${response.status}`;
        console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            error: errorMessage
        });
        throw new Error(errorMessage);
    }
    return response.json();
};

// Helper function to handle fetch errors
const handleFetchError = (error) => {
    console.error('API Error Details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
    });

    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error(
            'Unable to connect to the server. Please ensure:\n' +
            '1. The backend server is running\n' +
            '2. You can access http://localhost:7197/api/Users in your browser\n' +
            '3. The server is not blocked by your firewall'
        );
    }
    throw error;
};

// Helper function to check server status
const checkServerStatus = async () => {
    try {
        const response = await fetch(`${API_URL}/Users`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'include',
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Server status check failed:', error);
        return false;
    }
};

export const ROLES = {
    STUDENT: 'Student',
    INSTRUCTOR: 'Instructor'
};

export const authService = {
    async register(userData) {
        // Check server status first
        const isServerAvailable = await checkServerStatus();
        if (!isServerAvailable) {
            throw new Error('Server is not available. Please check if the backend is running.');
        }

        try {
            console.log('Attempting registration with:', { ...userData, password: '[REDACTED]' });
            const response = await fetch(`${API_URL}/Users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    userId: crypto.randomUUID(),
                    name: userData.name,
                    email: userData.email,
                    passwordHash: userData.password,
                    role: userData.role || ROLES.STUDENT,
                    courseIds: []
                }),
            }).catch(handleFetchError);

            const newUser = await handleResponse(response);
            console.log('Registration successful:', { ...newUser, passwordHash: '[REDACTED]' });
            this.setUserSession(newUser);
            return newUser;
        } catch (error) {
            console.error('Registration error:', error);
            throw new Error(error.message || 'Registration failed. Please try again.');
        }
    },

    async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/Users`, {
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'include'
            }).catch(handleFetchError);
            
            const users = await handleResponse(response);
            const user = users.find(u => u.email === email);
            
            if (!user || user.passwordHash !== password) {
                throw new Error('Invalid email or password');
            }

            this.setUserSession(user);
            return user;
        } catch (error) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Login failed. Please try again.');
        }
    },

    async fetchCourses() {
        try {
            const response = await fetch(`${API_URL}/Courses`, {
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'include'
            }).catch(handleFetchError);
            return handleResponse(response);
        } catch (error) {
            console.error('Fetch courses error:', error);
            throw new Error('Failed to fetch courses. Please try again.');
        }
    },

    setUserSession(user) {
        const userData = {
            id: user.userId,
            name: user.name,
            email: user.email,
            role: user.role
        };
        localStorage.setItem('user', JSON.stringify(userData));
    },

    logout() {
        localStorage.removeItem('user');
    },

    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated() {
        return !!this.getCurrentUser();
    },

    hasRole(role) {
        const user = this.getCurrentUser();
        return user?.role === role;
    },

    isStudent() {
        return this.hasRole(ROLES.STUDENT);
    },

    isInstructor() {
        return this.hasRole(ROLES.INSTRUCTOR);
    }
}; 