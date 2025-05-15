import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './Dashboard.css';

const InstructorDashboard = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authService.isInstructor()) {
            navigate('/login');
            return;
        }
        fetchInstructorCourses();
    }, [navigate]);

    const fetchInstructorCourses = async () => {
        try {
            const response = await fetch(`http://localhost:7197/api/Courses`);
            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }
            const data = await response.json();
            setCourses(data);
        } catch (err) {
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleCreateCourse = () => {
        navigate('/create-course');
    };

    if (loading) {
        return <div className="dashboard-loading">Loading...</div>;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Instructor Dashboard</h1>
                <div className="user-info">
                    <span>Welcome, {user?.name}</span>
                    <button onClick={handleLogout} className="logout-button">
                        Logout
                    </button>
                </div>
            </header>

            {error && <div className="error-message">{error}</div>}

            <main className="dashboard-content">
                <section className="courses-section">
                    <div className="section-header">
                        <h2>Your Courses</h2>
                        <button onClick={handleCreateCourse} className="create-button">
                            Create New Course
                        </button>
                    </div>
                    {courses.length === 0 ? (
                        <p>No courses created yet.</p>
                    ) : (
                        <div className="courses-grid">
                            {courses.map(course => (
                                <div key={course.courseId} className="course-card">
                                    <h3>{course.title}</h3>
                                    <p>{course.description}</p>
                                    <div className="course-actions">
                                        <button onClick={() => navigate(`/course/${course.courseId}/manage`)}>
                                            Manage Course
                                        </button>
                                        <button onClick={() => navigate(`/course/${course.courseId}/assessments`)}>
                                            View Assessments
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default InstructorDashboard; 