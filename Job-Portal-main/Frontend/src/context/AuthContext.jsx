import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/apiConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (email, password, isAdmin = false) => {
        const url = isAdmin ? `${API_URL}/api/auth/admin/verify` : `${API_URL}/api/auth/login`;
        // Note: Admin login flow is 2-step (OTP). This login fn handles the final step or standard user login.
        // For Admin OTP Request, we need a separate function.

        try {
            const { data } = await axios.post(url, { email, ...(isAdmin ? { otp: password } : { password }) });
            // If isAdmin, 'password' arg is treated as OTP for simplicity in this function sig

            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            return data;
        } catch (error) {
            console.error(error);
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const requestAdminOtp = async (email) => {
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/admin/login`, { email });
            return data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to send OTP';
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/register`, userData);
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
        } catch (error) {
            throw error.response?.data?.message || 'Registration failed';
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, requestAdminOtp }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
