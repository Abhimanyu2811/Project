import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import InstructorDashboard from './components/InstructorDashboard';
import AvailableCourses from './components/AvailableCourses';
import { authService, ROLES } from './services/authService';
import CreateCourse from './components/CreateCourse';
import './App.css';

// Role-based Protected Route component
const RoleProtectedRoute = ({ children, allowedRoles }) => {
    const user = authService.getCurrentUser();
    
    if (!user) {
        return <Navigate to="/login" />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        return <Navigate to={user.role === ROLES.INSTRUCTOR ? '/instructor-dashboard' : '/student-dashboard'} />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Student routes */}
                    <Route
                        path="/student-dashboard"
                        element={
                            <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                                <StudentDashboard />
                            </RoleProtectedRoute>
                        }
                    />
                    <Route
                        path="/available-courses"
                        element={
                            <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                                <AvailableCourses />
                            </RoleProtectedRoute>
                        }
                    />

                    {/* Instructor routes */}
                    <Route
                        path="/instructor-dashboard"
                        element={
                            <RoleProtectedRoute allowedRoles={[ROLES.INSTRUCTOR]}>
                                <InstructorDashboard />
                            </RoleProtectedRoute>
                        }
                    />

                    {/* Create course route */}
                    <Route
                        path="/create-course"
                        element={
                            <RoleProtectedRoute allowedRoles={[ROLES.INSTRUCTOR]}>
                                <CreateCourse />
                            </RoleProtectedRoute>
                        }
                    />

                    {/* Default route - redirect based on role */}
                    <Route
                        path="/"
                        element={
                            <Navigate
                                to={
                                    authService.isAuthenticated()
                                        ? authService.isInstructor()
                                            ? '/instructor-dashboard'
                                            : '/student-dashboard'
                                        : '/login'
                                }
                            />
                        }
                    />

                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
