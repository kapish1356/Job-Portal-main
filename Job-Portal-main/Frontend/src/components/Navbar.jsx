import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/">Get Your Job</Link>
            </div>
            <ul className="navbar-links">
                <li><NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink></li>

                {/* Guest Links */}
                {!user && (
                    <>
                        <li><NavLink to="/login" className={({ isActive }) => isActive ? "active" : ""}>Login</NavLink></li>
                        <li><NavLink to="/register" className={({ isActive }) => isActive ? "active" : ""}>Register</NavLink></li>
                        <li><NavLink to="/admin/login" className={({ isActive }) => isActive ? "active" : ""}>Admin</NavLink></li>
                    </>
                )}

                {/* User Links */}
                {user && user.role !== 'admin' && (
                    <>
                        <li><NavLink to="/user/dashboard" className={({ isActive }) => isActive ? "active" : ""}>Dashboard</NavLink></li>
                        <li><button onClick={handleLogout} className="btn-logout">Logout</button></li>
                    </>
                )}

                {/* Admin Links */}
                {user && user.role === 'admin' && (
                    <>
                        <li><NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "active" : ""}>Dashboard</NavLink></li>
                        <li><button onClick={handleLogout} className="btn-logout">Logout</button></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
