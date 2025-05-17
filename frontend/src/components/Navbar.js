import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService, { ROLES } from '../services/authService';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();
    const [isNavCollapsed, setIsNavCollapsed] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleNavbar = () => {
        setIsNavCollapsed(!isNavCollapsed);
    };

    const handleHomeClick = (e) => {
        e.preventDefault();
        if (isAuthenticated) {
            if (user.role === ROLES.INSTRUCTOR) {
                navigate('/instructor-dashboard');
            } else {
                navigate('/student-dashboard');
            }
        } else {
            navigate('/');
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link to="/" className="navbar-brand fw-bold" onClick={handleHomeClick}>
                    EduSync
                </Link>
                
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    onClick={toggleNavbar}
                    aria-controls="navbarContent"
                    aria-expanded={!isNavCollapsed}
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="navbarContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link to="/" className="nav-link" onClick={handleHomeClick}>
                                Home
                            </Link>
                        </li>
                        {isAuthenticated && (
                            <>
                                <li className="nav-item">
                                    <Link to="/courses" className="nav-link">
                                        Courses
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/assessments" className="nav-link">
                                        Assessments
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/results" className="nav-link">
                                        Results
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>

                    <div className="d-flex align-items-center">
                        {isAuthenticated ? (
                            <>
                                <span className="text-light me-3">
                                    Welcome, <span className="fw-bold">{user?.name}</span>
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="btn btn-outline-light ms-2"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <div className="d-flex gap-2">
                                <Link to="/login" className="btn btn-outline-light">
                                    Login
                                </Link>
                                <Link to="/register" className="btn btn-primary">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 