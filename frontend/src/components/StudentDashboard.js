import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('http://localhost:7197/api/Courses', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch courses');
            }

            const data = await response.json();
            console.log('Fetched courses:', data);
            setCourses(data);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError(err.message || 'Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:7197/api/Courses/${courseId}/enroll`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to enroll in course');
            }

            // Refresh the courses list after successful enrollment
            await fetchCourses();
        } catch (err) {
            console.error('Error enrolling in course:', err);
            setError(err.message || 'Failed to enroll in course');
        }
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Available Courses</h1>
            
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {courses.length === 0 ? (
                <div className="alert alert-info">
                    No courses available at the moment.
                </div>
            ) : (
                <div className="row">
                    {courses.map((course) => (
                        <div key={course.courseId} className="col-md-6 col-lg-4 mb-4">
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">{course.title}</h5>
                                    <p className="card-text text-muted">{course.description}</p>
                                    {course.mediaUrl && (
                                        <p className="card-text">
                                            <small className="text-muted">Media: {course.mediaUrl}</small>
                                        </p>
                                    )}
                                    <div className="mt-3">
                                        <p className="card-text">
                                            <small className="text-muted">
                                                Instructor: {course.instructor?.name || 'Unknown'}
                                            </small>
                                        </p>
                                    </div>
                                </div>
                                <div className="card-footer bg-transparent border-top-0">
                                    <button
                                        onClick={() => handleEnroll(course.courseId)}
                                        className="btn btn-primary w-100"
                                    >
                                        Enroll Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentDashboard; 