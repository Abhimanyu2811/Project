import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './Dashboard.css';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authService.isStudent()) {
            navigate('/login');
            return;
        }
        fetchStudentCourses();
    }, [navigate]);

    const fetchStudentCourses = async () => {
        try {
            const data = await authService.fetchCourses();
            // Filter courses that the student is enrolled in
            const enrolledCourses = data.filter(course => 
                course.userIds?.includes(user.id)
            );
            setCourses(enrolledCourses);
        } catch (err) {
            setError(err.message || 'Failed to load courses');
            console.error('Error fetching courses:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleViewCourse = (courseId) => {
        navigate(`/course/${courseId}`);
    };

    if (loading) {
        return <div className="dashboard-loading">Loading...</div>;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Student Dashboard</h1>
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
                        <button 
                            onClick={() => navigate('/available-courses')} 
                            className="browse-button"
                        >
                            Browse Available Courses
                        </button>
                    </div>
                    {courses.length === 0 ? (
                        <div className="empty-state">
                            <p>You haven't enrolled in any courses yet.</p>
                            <button 
                                onClick={() => navigate('/available-courses')}
                                className="primary-button"
                            >
                                Browse Courses
                            </button>
                        </div>
                    ) : (
                        <div className="courses-grid">
                            {courses.map(course => (
                                <div key={course.courseId} className="course-card">
                                    <h3>{course.title}</h3>
                                    <p>{course.description}</p>
                                    <div className="course-meta">
                                        <span>Instructor: {course.instructorName}</span>
                                        <span>Students: {course.userIds?.length || 0}</span>
                                    </div>
                                    <div className="course-actions">
                                        <button 
                                            onClick={() => handleViewCourse(course.courseId)}
                                            className="view-button"
                                        >
                                            View Course
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

export default StudentDashboard; 