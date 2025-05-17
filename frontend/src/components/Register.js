import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../services/authService';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: ROLES.STUDENT // Default role
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Step 1: Register the user
            const registerResponse = await fetch('http://localhost:7197/api/Auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            let registerData;
            const contentType = registerResponse.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                registerData = await registerResponse.json();
            } else {
                const textResponse = await registerResponse.text();
                if (!textResponse.toLowerCase().includes('success')) {
                    throw new Error(textResponse);
                }
            }

            if (!registerResponse.ok) {
                throw new Error(registerData?.message || registerData?.title || 'Registration failed');
            }

            // Step 2: Login the user
            const loginResponse = await fetch('http://localhost:7197/api/Auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name
                })
            });

            if (!loginResponse.ok) {
                // If login fails, redirect to login page with a message
                navigate('/login', { 
                    state: { 
                        message: 'Registration successful! Please log in with your credentials.' 
                    }
                });
                return;
            }

            const loginData = await loginResponse.json();
            
            // Store the token and user data
            localStorage.setItem('token', loginData.token);
            localStorage.setItem('user', JSON.stringify(loginData.user));
            
            // Update auth context
            login(loginData.user, loginData.token);
            
            // Redirect based on role
            if (loginData.user.role === ROLES.INSTRUCTOR) {
                navigate('/instructor-dashboard');
            } else {
                navigate('/student-dashboard');
            }
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid bg-light min-vh-100">
            <div className="row justify-content-center align-items-center min-vh-100">
                <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                    <div className="card shadow-lg border-0 rounded-lg">
                        <div className="card-header bg-primary text-white text-center py-4">
                            <h3 className="mb-0 fw-bold">Create Account</h3>
                            <p className="mb-0">Join EduSync today</p>
                        </div>
                        <div className="card-body p-5">
                            {error && (
                                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                    {error}
                                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="form-floating mb-3">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        className="form-control"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label htmlFor="name">Full Name</label>
                                </div>

                                <div className="form-floating mb-3">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        className="form-control"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label htmlFor="email">Email address</label>
                                </div>

                                <div className="form-floating mb-3">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        className="form-control"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label htmlFor="password">Password</label>
                                </div>

                                <div className="form-floating mb-4">
                                    <select
                                        id="role"
                                        name="role"
                                        className="form-select"
                                        value={formData.role}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value={ROLES.STUDENT}>Student</option>
                                        <option value={ROLES.INSTRUCTOR}>Instructor</option>
                                    </select>
                                    <label htmlFor="role">Select Role</label>
                                </div>

                                <div className="d-grid">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Creating Account...
                                            </>
                                        ) : 'Create Account'}
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="card-footer text-center py-3 bg-light">
                            <div className="small">
                                Already have an account?{' '}
                                <a href="/login" className="text-primary fw-bold">Sign in!</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register; 