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
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
                <Link
                    to="/create-course"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Create New Course
                </Link>
            </div>

            <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Courses</h2>
                {courses.length === 0 ? (
                    <p className="text-gray-500">You haven't created any courses yet.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="bg-white overflow-hidden shadow rounded-lg"
                            >
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {course.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {course.description}
                                    </p>
                                    <div className="mt-4">
                                        <Link
                                            to={`/courses/${course.id}`}
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
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