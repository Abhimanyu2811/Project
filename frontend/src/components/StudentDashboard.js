import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchEnrolledCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            console.log('Fetching enrolled courses...');

            const response = await fetch('http://localhost:7197/api/Courses/enrolled', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch enrolled courses: ${response.status}`);
            }

            const data = await response.json();
            console.log('Fetched enrolled courses:', data);
            setEnrolledCourses(data);
        } catch (err) {
            console.error('Error fetching enrolled courses:', err);
            setError(err.message || 'Failed to load enrolled courses');
        }
    };

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            console.log('Fetching available courses...');

            const response = await fetch('http://localhost:7197/api/Courses', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch courses: ${response.status}`);
            }

            const data = await response.json();
            console.log('Fetched courses:', data);
            // Filter out courses that are already enrolled
            const availableCourses = data.filter(course => 
                !enrolledCourses.some(enrolled => enrolled.courseId === course.courseId)
            );
            setCourses(availableCourses);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError(err.message || 'Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await Promise.all([fetchEnrolledCourses(), fetchCourses()]);
            } catch (err) {
                console.error('Error loading data:', err);
                setError(err.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleEnroll = async (courseId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            console.log('Attempting to enroll in course:', courseId);

            const response = await fetch(`http://localhost:7197/api/Courses/${courseId}/enroll`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'omit'
            });

            const data = await response.json().catch(() => ({}));
            
            if (!response.ok) {
                console.error('Enrollment error response:', data);
                throw new Error(data.message || `Failed to enroll: ${response.status}`);
            }

            console.log('Enrollment successful:', data);

            // Refresh both enrolled and available courses
            await Promise.all([fetchEnrolledCourses(), fetchCourses()]);
            alert(data.message || 'Successfully enrolled in the course!');
        } catch (err) {
            console.error('Error enrolling in course:', err);
            if (err.message.includes('Failed to fetch')) {
                setError('Network error: Please check if the backend server is running and accessible.');
            } else {
                setError(err.message || 'Failed to enroll in course');
            }
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
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Enrolled Courses Section */}
            <div className="mb-5">
                <h2 className="mb-4">My Enrolled Courses</h2>
                {enrolledCourses.length === 0 ? (
                    <div className="alert alert-info">
                        You haven't enrolled in any courses yet.
                    </div>
                ) : (
                    <div className="row">
                        {enrolledCourses.map((course) => (
                            <div key={course.courseId} className="col-md-6 col-lg-4 mb-4">
                                <div className="card h-100 shadow-sm border-success">
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
                                        <Link to={`/course/${course.courseId}`} className="btn btn-success w-100">
                                            View Course
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Available Courses Section */}
            <div>
                <h2 className="mb-4">Available Courses</h2>
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
        </div>
    );
};

export default StudentDashboard; 