import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [isNavCollapsed, setIsNavCollapsed] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleNavbar = () => {
        setIsNavCollapsed(!isNavCollapsed);
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link to="/" className="navbar-brand fw-bold">
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
                            <Link to="/" className="nav-link">
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

                    <div className="d-flex">
                        {isAuthenticated ? (
                            <button
                                onClick={handleLogout}
                                className="btn btn-outline-light"
                            >
                                Logout
                            </button>
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