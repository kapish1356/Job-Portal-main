import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', mobile: '', address: '', qualification: ''
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(formData);
            navigate('/user/dashboard');
        } catch (error) {
            // Show error toast
            setToast({ show: true, message: error, type: 'error' });
            setTimeout(() => {
                setToast({ show: false, message: '', type: '' });
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`toast-notification ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
                    <div className="toast-icon">{toast.type === 'error' ? '❌' : '✅'}</div>
                    <div className="toast-content">
                        <h4>{toast.type === 'error' ? 'Error' : 'Success'}</h4>
                        <p>{toast.message}</p>
                    </div>
                    <button className="toast-close" onClick={() => setToast({ show: false, message: '', type: '' })}>×</button>
                </div>
            )}

            <div>
                <h2>Create Account </h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            onChange={handleChange}
                            placeholder="Create a strong password"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Mobile Number</label>
                        <input
                            type="tel"
                            name="mobile"
                            onChange={handleChange}
                            placeholder="Enter your mobile number"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Address</label>
                        <textarea
                            name="address"
                            onChange={handleChange}
                            placeholder="Enter your address"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Qualification</label>
                        <input
                            type="text"
                            name="qualification"
                            onChange={handleChange}
                            placeholder="e.g., Bachelor's in Computer Science"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className={`btn-auth ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Register & Apply'}
                    </button>
                    <div className="auth-links">
                        <p>
                            Already have an account?{' '}
                            <Link to="/login">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
