import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            const returnUrl = location.state?.returnUrl || '/user/dashboard';
            navigate(returnUrl);
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
                <h2>Welcome Back! 👋</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className={`btn-auth ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                    <div className="auth-links">
                        <p>
                            Don't have an account?{' '}
                            <Link to="/register">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
