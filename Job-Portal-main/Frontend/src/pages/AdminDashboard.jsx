import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { geocodeAddress } from '../config/geoapifyConfig';
import './Dashboard.css'; // Shared dashboard CSS
import API_URL from '../config/apiConfig';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [businesses, setBusinesses] = useState([]);
    const [activeTab, setActiveTab] = useState('businesses');
    const [newBusiness, setNewBusiness] = useState({
        name: '', description: '', address: '', type: 'IT', lat: '', lng: ''
    });

    const [newJob, setNewJob] = useState({
        title: '', details: '', type: 'IT', salaryRange: '', businessId: ''
    });

    const [applications, setApplications] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [messageContent, setMessageContent] = useState('');
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [unreadCount, setUnreadCount] = useState(0);
    const [geocoding, setGeocoding] = useState(false);

    useEffect(() => {
        fetchMyBusinesses();
        fetchUnreadCount();
    }, []);

    const fetchMyBusinesses = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/api/businesses/mine`, config);
            setBusinesses(data);
            if (data.length > 0) setNewJob({ ...newJob, businessId: data[0]._id });
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddBusiness = async (e) => {
        e.preventDefault();
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/api/businesses`, newBusiness, config);
            setToast({ show: true, message: 'Business Added Successfully!', type: 'success' });
            setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
            setNewBusiness({ name: '', description: '', address: '', type: 'IT', lat: '', lng: '' });
            fetchMyBusinesses();
        } catch (error) {
            setToast({ show: true, message: error.response?.data?.message || 'Error adding business', type: 'error' });
            setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
        }
    };

    const handleGeocodeAddress = async () => {
        if (!newBusiness.address.trim()) {
            setToast({ show: true, message: 'Please enter an address first', type: 'error' });
            setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
            return;
        }

        setGeocoding(true);
        try {
            const results = await geocodeAddress(newBusiness.address);
            if (results.length > 0) {
                const firstResult = results[0];
                setNewBusiness({
                    ...newBusiness,
                    lat: firstResult.lat.toString(),
                    lng: firstResult.lon.toString()
                });
                setToast({ show: true, message: '✅ Coordinates found successfully!', type: 'success' });
                setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
            } else {
                setToast({ show: true, message: 'No coordinates found for this address. Please try a more specific address.', type: 'error' });
                setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            setToast({ show: true, message: 'Error finding coordinates. Please enter manually.', type: 'error' });
            setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
        } finally {
            setGeocoding(false);
        }
    };

    const handleAddJob = async (e) => {
        e.preventDefault();
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/api/jobs`, newJob, config);
            setToast({ show: true, message: 'Job Posted Successfully!', type: 'success' });
            setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
            setNewJob({ ...newJob, title: '', details: '', salaryRange: '' });
        } catch (error) {
            setToast({ show: true, message: error.response?.data?.message || 'Error posting job', type: 'error' });
            setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
        }
    };

    const fetchApplicants = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/api/applications/admin/all`, config);
            setApplicants(data);
        } catch (error) {
            console.error(error);
        }
    };

    // Simplified: Fetch all messages/inbox
    const [messages, setMessages] = useState([]);
    const fetchInbox = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/api/messages`, config);
            setMessages(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/api/messages/unread/count`, config);
            setUnreadCount(data.count);
        } catch (error) {
            console.error(error);
        }
    };

    const markMessagesAsRead = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_URL}/api/messages/mark-read`, {}, config);
            setUnreadCount(0);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (activeTab === 'inbox') {
            fetchInbox();
            markMessagesAsRead();
        }
        if (activeTab === 'applicants') fetchApplicants();
    }, [activeTab]);

    const handleSendMessage = async () => {
        if (!messageContent.trim()) {
            setToast({ show: true, message: 'Please enter a message', type: 'error' });
            setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
            return;
        }

        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/api/messages`, {
                receiverId: selectedApplicant.userId._id,
                receiverModel: 'User',
                content: messageContent
            }, config);

            setToast({ show: true, message: 'Message sent successfully!', type: 'success' });
            setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
            setShowMessageModal(false);
            setMessageContent('');
            setSelectedApplicant(null);
            fetchUnreadCount();
        } catch (error) {
            setToast({ show: true, message: error.response?.data?.message || 'Error sending message', type: 'error' });
            setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
        }
    };

    const handleReply = (message) => {
        setSelectedMessage(message);
        setShowReplyModal(true);
    };

    const sendReply = async () => {
        if (!replyContent.trim()) {
            setToast({ show: true, message: 'Please enter a message', type: 'error' });
            setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
            return;
        }

        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/api/messages`, {
                receiverId: selectedMessage.senderId._id,
                receiverModel: 'User',
                content: replyContent
            }, config);

            setToast({ show: true, message: 'Reply sent successfully!', type: 'success' });
            setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
            setShowReplyModal(false);
            setReplyContent('');
            setSelectedMessage(null);
            fetchUnreadCount();
        } catch (error) {
            setToast({ show: true, message: error.response?.data?.message || 'Error sending reply', type: 'error' });
            setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
        }
    };

    return (
        <div className="dashboard-container">
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

            {/* Message Modal */}
            {showMessageModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Send Message to {selectedApplicant?.userId?.name}</h3>
                        <div className="modal-textarea-container">
                            <label className="modal-textarea-label">Your Message</label>
                            <textarea
                                className="modal-textarea"
                                placeholder="Type your message here..."
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                                rows="5"
                            />
                        </div>
                        <div className="modal-buttons">
                            <button onClick={handleSendMessage} className="modal-button-primary">Send Message</button>
                            <button onClick={() => { setShowMessageModal(false); setMessageContent(''); setSelectedApplicant(null); }} className="modal-button-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reply Modal */}
            {showReplyModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Reply to {selectedMessage?.senderId?.name}</h3>
                        <div className="modal-original-message">
                            <span className="modal-original-message-label">Original Message</span>
                            <div>"{selectedMessage?.content}"</div>
                        </div>
                        <div className="modal-textarea-container">
                            <label className="modal-textarea-label">Your Reply</label>
                            <textarea
                                className="modal-textarea"
                                placeholder="Type your reply here..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                rows="5"
                            />
                        </div>
                        <div className="modal-buttons">
                            <button onClick={sendReply} className="modal-button-primary">Send Reply</button>
                            <button onClick={() => { setShowReplyModal(false); setReplyContent(''); setSelectedMessage(null); }} className="modal-button-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <h1>Admin Dashboard</h1>
            <div className="dashboard-tabs">
                <button onClick={() => setActiveTab('businesses')} className={activeTab === 'businesses' ? 'active' : ''}>My Businesses</button>
                <button onClick={() => setActiveTab('add-business')} className={activeTab === 'add-business' ? 'active' : ''}>Add Business</button>
                <button onClick={() => setActiveTab('add-job')} className={activeTab === 'add-job' ? 'active' : ''}>Post Job</button>
                <button onClick={() => setActiveTab('applicants')} className={activeTab === 'applicants' ? 'active' : ''}>Applicants</button>
                <button onClick={() => setActiveTab('inbox')} className={activeTab === 'inbox' ? 'active' : ''} style={{ position: 'relative' }}>
                    Inbox
                    {unreadCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            border: '2px solid white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}>
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'businesses' && (
                    <div>
                        <h3>My Businesses</h3>
                        {businesses.map(b => (
                            <div key={b._id} className="card">
                                <h4>{b.name}</h4>
                                <p>{b.address}</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'add-business' && (
                    <form onSubmit={handleAddBusiness} className="form-stack">
                        <input placeholder="Business Name" value={newBusiness.name} onChange={e => setNewBusiness({ ...newBusiness, name: e.target.value })} required />
                        <textarea placeholder="Description (optional)" value={newBusiness.description} onChange={e => setNewBusiness({ ...newBusiness, description: e.target.value })} />

                        <div style={{ marginBottom: '0.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.4rem',
                                fontWeight: 700,
                                color: '#ffffff',
                                fontSize: '1.1rem'
                            }}>
                                Business Address *
                            </label>
                            <input
                                placeholder="Enter full address (e.g., 123 Main St, Mumbai, Maharashtra)"
                                value={newBusiness.address}
                                onChange={e => setNewBusiness({ ...newBusiness, address: e.target.value })}
                                required
                                style={{ marginBottom: '0.5rem' }}
                            />
                            <button
                                type="button"
                                onClick={handleGeocodeAddress}
                                disabled={geocoding || !newBusiness.address.trim()}
                                style={{
                                    padding: '0.65rem 1.25rem',
                                    background: geocoding ? '#cbd5e0' : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: geocoding || !newBusiness.address.trim() ? 'not-allowed' : 'pointer',
                                    width: '100%',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {geocoding ? '🔍 Finding Coordinates...' : '📍 Get Coordinates from Address'}
                            </button>
                        </div>

                        <select value={newBusiness.type} onChange={e => setNewBusiness({ ...newBusiness, type: e.target.value })}>
                            <option value="IT">IT</option>
                            <option value="Sale & Service">Sale & Service</option>
                            <option value="Hotel Service">Hotel Service</option>
                        </select>

                        <div style={{ marginBottom: '0.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.4rem',
                                fontWeight: 700,
                                color: '#ffffff',
                                fontSize: '1.1rem'
                            }}>
                                Location Coordinates *
                            </label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    placeholder="Latitude (e.g., 19.0760)"
                                    value={newBusiness.lat}
                                    onChange={e => setNewBusiness({ ...newBusiness, lat: e.target.value })}
                                    required
                                    style={{ flex: 1 }}
                                />
                                <input
                                    placeholder="Longitude (e.g., 72.8777)"
                                    value={newBusiness.lng}
                                    onChange={e => setNewBusiness({ ...newBusiness, lng: e.target.value })}
                                    required
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                        <button type="submit" style={{ marginTop: '0.5rem' }}>Add Business</button>
                    </form>
                )}

                {activeTab === 'add-job' && (
                    <form onSubmit={handleAddJob} className="form-stack">
                        <select value={newJob.businessId} onChange={e => setNewJob({ ...newJob, businessId: e.target.value })} required>
                            <option value="">Select Business</option>
                            {businesses.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                        <input placeholder="Job Title" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} required />
                        <textarea placeholder="Details" value={newJob.details} onChange={e => setNewJob({ ...newJob, details: e.target.value })} />
                        <input placeholder="Salary Range" value={newJob.salaryRange} onChange={e => setNewJob({ ...newJob, salaryRange: e.target.value })} />
                        <button type="submit">Post Job</button>
                    </form>
                )}

                {activeTab === 'applicants' && (
                    <div>
                        <h3>Job Applicants</h3>
                        {applicants.length === 0 ? <p>No applicants yet.</p> : (
                            applicants.map(app => (
                                <div key={app._id} className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>👤 {app.applicantName}</h4>
                                            <p style={{ margin: '0.5rem 0' }}><strong>📧 Email:</strong> {app.applicantEmail}</p>
                                            <p style={{ margin: '0.5rem 0' }}><strong>📱 Mobile:</strong> {app.applicantMobile}</p>
                                            <p style={{ margin: '0.5rem 0' }}><strong>🎓 Qualification:</strong> {app.applicantQualification}</p>
                                            <p style={{ margin: '0.5rem 0' }}><strong>💼 Applied for:</strong> {app.jobId?.title || 'Unknown Job'}</p>
                                            <p style={{ margin: '0.5rem 0' }}><strong>🏢 Business:</strong> {app.jobId?.businessId?.name || 'Unknown'}</p>
                                            <p style={{ margin: '0.5rem 0' }}><strong>📅 Applied:</strong> {new Date(app.createdAt).toLocaleDateString()} at {new Date(app.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                        <button
                                            onClick={() => { setSelectedApplicant(app); setShowMessageModal(true); }}
                                            style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                        >
                                            Send Message
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'inbox' && (
                    <div>
                        <h3>Inbox</h3>
                        {messages.length === 0 ? <p>No messages.</p> : (
                            messages.map(m => (
                                <div key={m._id} className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>💬 {m.senderId?.name || 'Unknown User'}</h4>
                                            <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.85rem' }}>
                                                <strong>From:</strong> {m.senderId?.email || 'Unknown'}
                                            </p>
                                            <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.85rem' }}>
                                                <strong>📅 Date:</strong> {new Date(m.createdAt).toLocaleDateString()} at {new Date(m.createdAt).toLocaleTimeString()}
                                            </p>
                                            <p style={{ margin: '1rem 0 0 0', padding: '1rem', background: '#f7fafc', borderRadius: '8px', borderLeft: '4px solid #4facfe' }}>
                                                {m.content}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleReply(m)}
                                            style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: '1rem' }}
                                        >
                                            Reply
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
