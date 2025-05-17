import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService, { ROLES } from '../services/authService';
import './Dashboard.css';

const InstructorDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('http://localhost:7197/api/Courses/instructor', {
                    headers: {
                        ...authService.getAuthHeader()
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch courses');
                }

                const data = await response.json();
                setCourses(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
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
                <h1 className="h2 fw-bold">Instructor Dashboard</h1>
                <Link
                    to="/create-course"
                    className="btn btn-primary"
                >
                    Create New Course
                </Link>
            </div>

            <div className="mt-4">
                <h2 className="h4 mb-4">Your Courses</h2>
                {courses.length === 0 ? (
                    <div className="alert alert-info" role="alert">
                        You haven't created any courses yet.
                    </div>
                ) : (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {courses.map((course) => (
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
                                            View Course Details
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

export default InstructorDashboard; 