import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, ROLES } from '../services/authService';
import './Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: ROLES.STUDENT
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'online', 'offline'

    // Check server status on component mount
    React.useEffect(() => {
        let isMounted = true;
        let retryCount = 0;
        const maxRetries = 3;

        const checkServerStatus = async () => {
            if (!isMounted) return;

            try {
                console.log('Checking server status...');
                const response = await fetch('http://localhost:7197/api/Users', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    },
                    credentials: 'include',
                    // Increase timeout for initial connection
                    signal: AbortSignal.timeout(10000)
                });

                if (!isMounted) return;

                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }

                console.log('Server is online');
                setServerStatus('online');
                retryCount = 0; // Reset retry count on success
            } catch (error) {
                console.error('Server status check failed:', error);
                if (!isMounted) return;

                if (retryCount < maxRetries) {
                    retryCount++;
                    console.log(`Retrying server status check (${retryCount}/${maxRetries})...`);
                    // Exponential backoff: 2s, 4s, 8s
                    setTimeout(checkServerStatus, Math.min(1000 * Math.pow(2, retryCount), 8000));
                } else {
                    console.error('Max retries reached, marking server as offline');
                    setServerStatus('offline');
                }
            }
        };

        // Initial check
        checkServerStatus();

        // Set up periodic checks every 30 seconds
        const intervalId = setInterval(() => {
            if (isMounted && serverStatus === 'offline') {
                retryCount = 0; // Reset retry count for periodic checks
                checkServerStatus();
            }
        }, 30000);

        // Cleanup
        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [serverStatus]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('Name is required');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!formData.email.includes('@')) {
            setError('Please enter a valid email address');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (!Object.values(ROLES).includes(formData.role)) {
            setError('Invalid role selected');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (serverStatus === 'offline') {
            setError('Server is currently unavailable. Please try again later.');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await authService.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });
            // Redirect based on role
            navigate(formData.role === ROLES.INSTRUCTOR ? '/instructor-dashboard' : '/student-dashboard');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
            // If it's a network error, update server status
            if (err.message.includes('Unable to connect to the server')) {
                setServerStatus('offline');
            }
        } finally {
            setLoading(false);
        }
    };

    if (serverStatus === 'checking') {
        return (
            <div className="auth-container">
                <div className="auth-box">
                    <div className="loading-message">Checking server status...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Register</h2>
                {serverStatus === 'offline' && (
                    <div className="server-status offline">
                        Server is currently unavailable. Please try again later.
                    </div>
                )}
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter your full name"
                            disabled={loading || serverStatus === 'offline'}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                            disabled={loading || serverStatus === 'offline'}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">Role:</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            className="form-select"
                            disabled={loading || serverStatus === 'offline'}
                        >
                            <option value={ROLES.STUDENT}>Student</option>
                            <option value={ROLES.INSTRUCTOR}>Instructor</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                            disabled={loading || serverStatus === 'offline'}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirm your password"
                            disabled={loading || serverStatus === 'offline'}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading || serverStatus === 'offline'}
                        className={serverStatus === 'offline' ? 'disabled' : ''}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p className="auth-switch">
                    Already have an account?{' '}
                    <span onClick={() => navigate('/login')} className="auth-link">
                        Login here
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Register; 