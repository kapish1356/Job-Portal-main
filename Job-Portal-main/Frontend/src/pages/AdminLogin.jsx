import React, { useState, useContext, useRef, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const [step, setStep] = useState(1); // 1: Email, 2: OTP
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [loading, setLoading] = useState(false);
    const { requestAdminOtp, login } = useContext(AuthContext);
    const navigate = useNavigate();

    // Create refs for all 6 OTP input boxes
    const otpRefs = useRef([]);

    useEffect(() => {
        // Initialize refs array
        otpRefs.current = otpRefs.current.slice(0, 6);
    }, []);

    // Show notification toast
    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 4000);
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await requestAdminOtp(email);
            setStep(2);
            showNotification('✅ OTP sent to your email successfully! Check your inbox.', 'success');
            // Focus on first OTP input after a short delay
            setTimeout(() => {
                otpRefs.current[0]?.focus();
            }, 100);
        } catch (error) {
            showNotification(error || 'Failed to send OTP. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newOtpValues = [...otpValues];
        newOtpValues[index] = value;
        setOtpValues(newOtpValues);

        // Auto-focus to next input if value is entered
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace') {
            if (!otpValues[index] && index > 0) {
                // If current box is empty, move to previous box
                otpRefs.current[index - 1]?.focus();
            }
        }
        // Handle left arrow
        else if (e.key === 'ArrowLeft' && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
        // Handle right arrow
        else if (e.key === 'ArrowRight' && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();

        // Check if pasted data is 6 digits
        if (/^\d{6}$/.test(pastedData)) {
            const newOtpValues = pastedData.split('');
            setOtpValues(newOtpValues);
            // Focus on last input
            otpRefs.current[5]?.focus();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpCode = otpValues.join('');

        if (otpCode.length !== 6) {
            showNotification('Please enter all 6 digits of the OTP', 'error');
            return;
        }

        setLoading(true);
        try {
            await login(email, otpCode, true); // true = isAdmin
            showNotification('✅ Login successful! Redirecting...', 'success');
            setTimeout(() => {
                navigate('/admin/dashboard');
            }, 1000);
        } catch (error) {
            showNotification(error || 'Invalid OTP. Please try again.', 'error');
            // Clear OTP inputs on error
            setOtpValues(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Notification Toast */}
            {notification.show && (
                <div className={`notification-toast ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div>
                <h2>Admin Portal 🔐</h2>
                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="auth-form">
                        <div className="form-group">
                            <label>Admin Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your admin email"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className={`btn-auth ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="auth-form">
                        <div className="form-group">
                            <label>Enter OTP</label>
                            <p className="otp-instruction">
                                Enter the 6-digit code sent to <strong>{email}</strong>
                            </p>
                            <div className="otp-input-container">
                                {otpValues.map((value, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (otpRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={value}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        onPaste={index === 0 ? handleOtpPaste : undefined}
                                        className="otp-input-box"
                                        autoComplete="off"
                                    />
                                ))}
                            </div>
                        </div>
                        <button
                            type="submit"
                            className={`btn-auth ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                                setStep(1);
                                setOtpValues(['', '', '', '', '', '']);
                            }}
                        >
                            Change Email
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminLogin;
