import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './Dashboard.css';
import API_URL from '../config/apiConfig';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const [applications, setApplications] = useState([]);
    const [activeTab, setActiveTab] = useState('applied');
    const [messages, setMessages] = useState([]);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchApplications();
        fetchInbox();
        fetchUnreadCount();
    }, []);

    const fetchApplications = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/api/applications/mine`, config);
            setApplications(data);
        } catch (error) {
            console.error(error);
        }
    };

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

    const handleReply = (message) => {
        setSelectedMessage(message);
        setShowReplyModal(true);
    };

    useEffect(() => {
        if (activeTab === 'inbox') {
            fetchInbox();
            markMessagesAsRead();
        }
    }, [activeTab]);

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
                receiverModel: 'Admin',
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

            {/* Reply Modal */}
            {showReplyModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Reply to {selectedMessage?.senderBusinessName || selectedMessage?.senderId?.name}</h3>
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

            <h1>Welcome, {user?.name}</h1>
            <div className="dashboard-tabs">
                <button onClick={() => setActiveTab('applied')} className={activeTab === 'applied' ? 'active' : ''}>Applied Jobs</button>
                <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>My Profile</button>
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
                {activeTab === 'applied' && (
                    <div>
                        <h3>Applied Jobs</h3>
                        {applications.length === 0 ? <p>No applications yet.</p> : (
                            applications.map(app => (
                                <div key={app._id} className="card">
                                    <h4>{app.jobId?.title || 'Unknown Job'}</h4>
                                    <p><strong>Business:</strong> {app.jobId?.businessId?.name || 'Unknown'}</p>
                                    <p><strong>Status:</strong> {app.status}</p>
                                    <p><strong>Date:</strong> {new Date(app.createdAt).toLocaleDateString()} at {new Date(app.createdAt).toLocaleTimeString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="card">
                        <p><strong>Name:</strong> {user?.name}</p>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Mobile:</strong> {user?.mobile}</p>
                        <p><strong>Address:</strong> {user?.address}</p>
                        <p><strong>Qualification:</strong> {user?.qualification}</p>
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
                                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>💬 {m.senderBusinessName || m.senderId?.name || 'Unknown'}</h4>
                                            <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.85rem' }}>
                                                <strong>From:</strong> {m.senderId?.email || 'Unknown'}
                                            </p>
                                            <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.85rem' }}>
                                                <strong>📅 Date:</strong> {new Date(m.createdAt).toLocaleDateString()} at {new Date(m.createdAt).toLocaleTimeString()}
                                            </p>
                                            <p style={{ margin: '1rem 0 0 0', padding: '1rem', background: '#f7fafc', borderRadius: '8px', borderLeft: '4px solid #667eea' }}>
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

export default UserDashboard;
