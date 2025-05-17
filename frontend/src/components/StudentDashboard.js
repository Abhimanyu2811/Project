import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService, { ROLES } from '../services/authService';
import './Dashboard.css';

const StudentDashboard = () => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            try {
                const response = await fetch('http://localhost:7197/api/Courses/enrolled', {
                    headers: {
                        ...authService.getAuthHeader()
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch enrolled courses');
                }

                const data = await response.json();
                setEnrolledCourses(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEnrolledCourses();
    }, []);

    if (loading) {
        return (
            <div className="container py-5">
                <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h2 fw-bold">Student Dashboard</h1>
                <Link
                    to="/available-courses"
                    className="btn btn-primary"
                >
                    Browse Courses
                </Link>
            </div>

            <div className="mt-4">
                <h2 className="h4 mb-4">Your Enrolled Courses</h2>
                {enrolledCourses.length === 0 ? (
                    <div className="alert alert-info" role="alert">
                        You haven't enrolled in any courses yet.
                    </div>
                ) : (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {enrolledCourses.map((course) => (
                            <div key={course.id} className="col">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <h3 className="card-title h5">
                                            {course.title}
                                        </h3>
                                        <p className="card-text text-muted">
                                            {course.description}
                                        </p>
                                        <Link
                                            to={`/courses/${course.id}`}
                                            className="btn btn-outline-primary btn-sm"
                                        >
                                            Continue Learning
                                        </Link>
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