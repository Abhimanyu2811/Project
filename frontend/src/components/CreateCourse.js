import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../services/courseService';
import { authService } from '../services/authService';
import './Course.css';

const CreateCourse = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        mediaUrl: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            setError('Course title is required');
            return false;
        }
        if (!formData.description.trim()) {
            setError('Course description is required');
            return false;
        }
        if (formData.title.length > 50) {
            setError('Course title must be less than 50 characters');
            return false;
        }
        if (formData.description.length > 200) {
            setError('Course description must be less than 200 characters');
            return false;
        }
        if (formData.mediaUrl && formData.mediaUrl.length > 50) {
            setError('Media URL must be less than 50 characters');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        const currentUser = authService.getCurrentUser();
        if (!currentUser || !authService.isInstructor()) {
            setError('Only instructors can create courses');
            return;
        }

        setLoading(true);

        try {
            await courseService.createCourse({
                ...formData,
                instructorId: currentUser.id
            });
            navigate('/instructor-dashboard');
        } catch (err) {
            setError(err.message || 'Failed to create course. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="course-container">
            <div className="course-box">
                <h2>Create New Course</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Course Title:</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Enter course title"
                            maxLength={50}
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Course Description:</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="Enter course description"
                            maxLength={200}
                            rows={4}
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="mediaUrl">Media URL (Optional):</label>
                        <input
                            type="url"
                            id="mediaUrl"
                            name="mediaUrl"
                            value={formData.mediaUrl}
                            onChange={handleChange}
                            placeholder="Enter media URL (e.g., video link)"
                            maxLength={50}
                            disabled={loading}
                        />
                    </div>
                    <div className="button-group">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="create-button"
                        >
                            {loading ? 'Creating...' : 'Create Course'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => navigate('/instructor-dashboard')}
                            disabled={loading}
                            className="cancel-button"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCourse; 