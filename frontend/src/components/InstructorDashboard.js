import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const InstructorDashboard = () => {
    const { user } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: '',
        mediaUrl: ''
    });

    useEffect(() => {
        fetchInstructorCourses();
    }, []);

    const fetchInstructorCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Get the stored user data
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (!storedUser || !storedUser.userId) {
                throw new Error('User data not found');
            }

            console.log('Fetching courses for instructor:', storedUser.userId);
            console.log('Using token:', token);

            const response = await fetch('http://localhost:7197/api/Courses', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error response:', errorData);
                
                if (response.status === 401) {
                    throw new Error('Authentication failed. Please log in again.');
                }
                if (response.status === 404) {
                    setCourses([]);
                    return;
                }
                throw new Error(errorData.message || `Failed to fetch courses: ${response.status}`);
            }

            const data = await response.json();
            console.log('Fetched all courses:', data);

            // Filter courses where instructor.userId matches the current user's ID
            const instructorCourses = data.filter(course => 
                course.instructor && course.instructor.userId === storedUser.userId
            );

            console.log('Filtered instructor courses:', instructorCourses);
            setCourses(instructorCourses);
        } catch (err) {
            console.error('Detailed error:', err);
            setError(err.message || 'Failed to load courses');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCourse(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted');
        setLoading(true);
        setError('');

        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            console.log('Stored user:', storedUser);

            if (!storedUser || !storedUser.userId) {
                throw new Error('User data not found');
            }

            const courseData = {
                courseId: crypto.randomUUID(),
                title: newCourse.title,
                description: newCourse.description,
                instructorId: storedUser.userId,
                mediaUrl: newCourse.mediaUrl || null
            };

            console.log('Creating course with data:', courseData);

            const response = await fetch('http://localhost:7197/api/Courses', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(courseData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create course');
            }

            // Reset form and refresh courses list
            setNewCourse({
                title: '',
                description: '',
                mediaUrl: ''
            });
            setShowForm(false);
            await fetchInstructorCourses();
        } catch (err) {
            setError(err.message || 'An error occurred while creating the course');
            console.error('Error creating course:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleForm = () => {
        console.log('Toggle form clicked, current state:', showForm);
        setShowForm(!showForm);
    };

    return (
        <div className="container-fluid mt-5">
            <div className="row">
                {/* Left Column - Courses List */}
                <div className="col-md-6">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className='text-secondary mb-0'>Your Courses</h1>
                        <button 
                            className="btn btn-primary"
                            onClick={toggleForm}
                            type="button"
                        >
                            {showForm ? 'Cancel' : 'Add Course'}
                        </button>
                    </div>
                    
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}
                    
                    {courses.length === 0 ? (
                        <div className="card shadow-sm">
                            <div className="card-body text-center py-5">
                                <p className="text-muted mb-0">No courses created yet</p>
                            </div>
                        </div>
                    ) : (
                        <div className="row">
                            {courses.map((course) => (
                                <div key={course.courseId} className="col-12 mb-3">
                                    <div className="card shadow-sm">
                                        <div className="card-body">
                                            <h5 className="card-title">{course.title}</h5>
                                            <p className="card-text text-muted">{course.description}</p>
                                            {course.mediaUrl && (
                                                <p className="card-text">
                                                    <small className="text-muted">Media: {course.mediaUrl}</small>
                                                </p>
                                            )}
                                            <div className="d-flex justify-content-end mt-3">
                                                <button className="btn btn-sm btn-outline-primary me-2">
                                                    Edit
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger">
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column - Course Form */}
                <div className="col-md-6">
                    {showForm && (
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h3 className="card-title mb-4">Create New Course</h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="title" className="form-label">Course Title</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="title"
                                            name="title"
                                            value={newCourse.title}
                                            onChange={handleInputChange}
                                            maxLength={50}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label">Description</label>
                                        <textarea
                                            className="form-control"
                                            id="description"
                                            name="description"
                                            value={newCourse.description}
                                            onChange={handleInputChange}
                                            maxLength={200}
                                            rows="3"
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="mediaUrl" className="form-label">Media URL (Optional)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="mediaUrl"
                                            name="mediaUrl"
                                            value={newCourse.mediaUrl}
                                            onChange={handleInputChange}
                                            maxLength={50}
                                        />
                                    </div>
                                    <div className="text-end">
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? 'Creating...' : 'Create Course'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstructorDashboard;