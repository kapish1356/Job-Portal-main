import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import GeoapifyMapComponent from '../components/GeoapifyMapComponent';
import { geocodeAddress } from '../config/geoapifyConfig';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { FaSync } from 'react-icons/fa';
import API_URL from '../config/apiConfig';

const Home = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState(''); // What user is typing
    const [filters, setFilters] = useState({
        keyword: '', // Active search term (after clicking Search)
        type: '',
        distance: '',
        salary: ''
    });

    const [showModal, setShowModal] = useState(false);
    const [selectedBusinessId, setSelectedBusinessId] = useState(null);
    const [applicantName, setApplicantName] = useState('');
    const [searchedLocation, setSearchedLocation] = useState(null); // For showing search pin

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // User Location State
    const [userLocation, setUserLocation] = useState({ lat: 28.6139, lng: 77.2090 }); // Default Mock (Delhi)

    // Get Real User Location on Mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log("📍 User Location Found:", position.coords);
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("⚠️ Geolocation error:", error);
                }
            );
        }
    }, []);

    const fetchBusinesses = async () => {
        setLoading(true);
        try {
            // Fetch all businesses directly
            const res = await axios.get(`${API_URL}/api/businesses`);
            let allBusinesses = res.data;

            // For each business, try to find an associated job
            const jobsRes = await axios.get(`${API_URL}/api/jobs`);
            const allJobs = jobsRes.data;

            // Map businesses with their first job (if any)
            const businessesWithJobs = allBusinesses.map(business => {
                // Find job for this business
                // businessId might be populated (object) or unpopulated (string)
                const job = allJobs.find(j => {
                    if (!j.businessId) return false;
                    // Handle both populated and unpopulated businessId
                    const jobBusinessId = typeof j.businessId === 'object' ? j.businessId._id : j.businessId;
                    return jobBusinessId.toString() === business._id.toString();
                });

                return {
                    ...business,
                    _jobId: job?._id || null,
                    salaryRange: job?.salaryRange || 'Not specified',
                    jobTitle: job?.title || 'Multiple positions'
                };
            });

            // Apply filters
            let filtered = businessesWithJobs;

            // Keyword filter (search in business name, address, or type)
            // Improved: Search for individual words, not just the entire phrase
            if (filters.keyword) {
                console.log('🔍 Searching for:', filters.keyword);
                const searchWords = filters.keyword.toLowerCase().split(' ').filter(word => word.length > 0);
                console.log('📝 Search words:', searchWords);

                filtered = filtered.filter(b => {
                    const businessText = `${b.name} ${b.address} ${b.type}`.toLowerCase();
                    const matches = searchWords.some(word => businessText.includes(word));

                    if (matches) {
                        console.log('✅ Match found:', b.name, '|', b.address, '|', b.type);
                    }

                    return matches;
                });

                console.log(`🎯 Found ${filtered.length} matching businesses`);
            }

            // Type filter
            if (filters.type) {
                filtered = filtered.filter(b => b.type === filters.type);
            }

            // Distance filter
            const center = searchedLocation || userLocation;
            if (filters.distance && center) {
                const radius = Number(filters.distance);
                filtered = filtered.filter(b => {
                    const dist = getDistance(
                        Number(center.lat),
                        Number(center.lng),
                        b.location.lat,
                        b.location.lng
                    );
                    return dist <= radius;
                });
            }

            console.log(`Fetched ${allBusinesses.length} businesses, filtered to ${filtered.length}.`);
            setBusinesses(filtered);
        } catch (error) {
            console.error("Error fetching businesses", error);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch when filters change (debouncing could be added)
    useEffect(() => {
        fetchBusinesses();
        // eslint-disable-next-line
    }, [filters, userLocation]); // Re-fetch if location updates (optional, might be too aggressive)

    const [applicationStatus, setApplicationStatus] = useState('idle'); // idle, submitting, success, error
    const [showToast, setShowToast] = useState(false);

    const handleApply = (business) => {
        if (!user) {
            navigate('/login', { state: { returnUrl: '/' } });
        } else {
            // Business object has _jobId attached from fetchBusinesses
            if (business._jobId) {
                setSelectedBusinessId(business._jobId);
                setShowModal(true);
                setApplicationStatus('idle');
            } else {
                console.error("No Job ID found for this business card");
                alert('Unable to apply - job information missing');
            }
        }
    };

    const submitApplication = async () => {
        setApplicationStatus('submitting');
        try {
            const token = user.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // selectedBusinessId is actually holding the Job ID in this context
            await axios.post(`${API_URL}/api/applications`, { jobId: selectedBusinessId }, config);

            // Close modal immediately and show toast
            setShowModal(false);
            setApplicationStatus('idle');
            setShowToast(true);

            // Hide toast after 3 seconds
            setTimeout(() => {
                setShowToast(false);
            }, 3000);
        } catch (error) {
            console.error("Application failed", error);
            setApplicationStatus('error');
            alert(error.response?.data?.message || 'Application failed');
        }
    };

    const handleSearch = async () => {
        // Don't geocode - just search by keyword
        // This prevents showing wrong locations on the map
        setSearchedLocation(null);
        setMapBounds(null); // Clear map bounds to show all search results
        setFilters({ ...filters, keyword: searchInput });
        setCurrentPage(1);
    };

    const handleRefresh = () => {
        setSearchInput('');
        setFilters({ keyword: '', type: '', distance: '', salary: '' });
        setMapBounds(null);
        setSearchedLocation(null);
        // Explicitly fetch businesses to force refresh
        fetchBusinesses();
    };

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180)
    }

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Adjust specific for UI, maybe 4, 8, or 12

    const [mapBounds, setMapBounds] = useState(null);

    // Filter by Map Bounds (if map has been moved)
    // Only apply map bounds filter if user has manually moved the map AND no active search
    const filteredBusinesses = businesses.filter(b => {
        // If there's an active search, don't filter by map bounds
        if (filters.keyword) return true;

        if (!mapBounds || !b.location) return true;
        const { lat, lng } = b.location;
        // Leaflet bounds.contains() expects a LatLng array [lat, lng]
        try {
            return mapBounds.contains([lat, lng]);
        } catch (e) {
            // If bounds not available yet, show all
            return true;
        }
    });

    const handleMapBoundsChange = (bounds) => {
        setMapBounds(bounds);
        setCurrentPage(1); // Reset pagination when map moves
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredBusinesses.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);


    return (
        <div className="home-container">
            {/* Toast Notification */}
            {showToast && (
                <div className="toast-notification">
                    <div className="toast-icon">🎉</div>
                    <div className="toast-content">
                        <h4>Application Submitted!</h4>
                        <p>Your application has been sent successfully</p>
                    </div>
                    <button className="toast-close" onClick={() => setShowToast(false)}>×</button>
                </div>
            )}

            {/* Modal Overlay */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Apply for Job</h3>
                        <p style={{ fontSize: '1rem', fontWeight: 600, color: '#2d3748', marginBottom: '1.25rem' }}>Review your details before applying.</p>

                        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#4a5568', fontSize: '0.9rem' }}>Name</label>
                            <input
                                type="text"
                                className="modal-input"
                                value={user?.name || ''}
                                readOnly
                                style={{ backgroundColor: '#f7fafc', cursor: 'not-allowed', padding: '0.75rem 1rem', marginBottom: 0 }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#4a5568', fontSize: '0.9rem' }}>Email</label>
                            <input
                                type="email"
                                className="modal-input"
                                value={user?.email || ''}
                                readOnly
                                style={{ backgroundColor: '#f7fafc', cursor: 'not-allowed', padding: '0.75rem 1rem', marginBottom: 0 }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#4a5568', fontSize: '0.9rem' }}>Mobile</label>
                            <input
                                type="text"
                                className="modal-input"
                                value={user?.mobile || ''}
                                readOnly
                                style={{ backgroundColor: '#f7fafc', cursor: 'not-allowed', padding: '0.75rem 1rem', marginBottom: 0 }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#4a5568', fontSize: '0.9rem' }}>Qualification</label>
                            <input
                                type="text"
                                className="modal-input"
                                value={user?.qualification || 'Not specified'}
                                readOnly
                                style={{ backgroundColor: '#f7fafc', cursor: 'not-allowed', padding: '0.75rem 1rem', marginBottom: 0 }}
                            />
                        </div>

                        <div className="modal-actions">
                            {applicationStatus === 'submitting' ? (
                                <button disabled className="btn-confirm" style={{ opacity: 0.7 }}>Submitting...</button>
                            ) : (
                                <>
                                    <button onClick={submitApplication} className="btn-confirm">Submit Application</button>
                                    <button onClick={() => setShowModal(false)} className="btn-cancel">Cancel</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="hero-section">
                <div className="hero-text">
                    <h1>Get Your Job</h1>
                    <p>Find the best businesses hiring near you.</p>

                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search by business name or location..."
                            className="search-input"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                        />
                        <button
                            className="btn-search"
                            onClick={handleSearch}
                            title="Search"
                        >
                            Search
                        </button>
                    </div>

                    <div className="filters">
                        <select
                            className="filter-select"
                            value={filters.type}
                            onChange={(e) => {
                                setFilters({ ...filters, type: e.target.value });
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">All Job Types</option>
                            <option value="IT">Software/IT</option>
                            <option value="Sale & Service">Sales & Service</option>
                            <option value="Hotel Service">Hotel Service</option>
                            <option value="Education">Education</option>
                            <option value="Healthcare">Healthcare</option>
                        </select>

                        <select
                            className="filter-select"
                            value={filters.distance}
                            onChange={(e) => {
                                setFilters({ ...filters, distance: e.target.value });
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">Distance Range</option>
                            <option value="5">Within 5 km</option>
                            <option value="10">Within 10 km</option>
                            <option value="50">Within 50 km</option>
                        </select>

                        <select
                            className="filter-select"
                            value={filters.salary}
                            onChange={(e) => setFilters({ ...filters, salary: e.target.value })}
                        >
                            <option value="">Salary Range</option>
                            <option value="high">High (&gt;50k)</option>
                            <option value="mid">Medium (20-50k)</option>
                            <option value="low">Entry Level</option>
                        </select>

                        <button className="btn-refresh" onClick={handleRefresh} title="Refresh Filters">
                            <FaSync />
                        </button>
                    </div>
                </div>

                <div className="map-container">
                    <GeoapifyMapComponent
                        businesses={businesses}
                        onBoundsChange={handleMapBoundsChange}
                        searchedLocation={searchedLocation}
                    />
                </div>
            </div>

            <div className="top-hiring-section">
                <h2>Top Hiring Businesses</h2>
                <div className="business-grid">
                    {currentItems.length > 0 ? (
                        currentItems.map(business => (
                            <div key={business._id} className="business-card">
                                <div className="business-card-image">
                                    <img
                                        src={`/images/${business.type.toLowerCase().replace(/\s+/g, '-')}.png`}
                                        alt={business.type}
                                        onError={(e) => { e.target.src = '/images/default-company.png'; }}
                                    />
                                </div>
                                <div className="business-card-content">
                                    <span className="badge">{business.type}</span>
                                    <h3>{business.name}</h3>
                                    <p className="business-location">{business.address}</p>
                                    {business.description && <p className="business-description">{business.description}</p>}
                                    <button className="btn-apply" onClick={() => handleApply(business)}>Apply Now</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No businesses found matching your criteria.</p>
                    )}
                </div>

                {/* Real Pagination - Smart with Ellipses */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="page-btn nav-btn"
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                            Prev
                        </button>

                        <div className="page-numbers">
                            {(() => {
                                const pageNumbers = [];
                                const maxVisibleButtons = 5; // How many buttons to show at most (excluding first/last)

                                if (totalPages <= maxVisibleButtons + 2) {
                                    // If few pages, show all
                                    for (let i = 1; i <= totalPages; i++) {
                                        pageNumbers.push(i);
                                    }
                                } else {
                                    // Always show first
                                    pageNumbers.push(1);

                                    // Calculate start/end of middle window
                                    let startPage = Math.max(2, currentPage - 1);
                                    let endPage = Math.min(totalPages - 1, currentPage + 1);

                                    // Adjust if near start
                                    if (currentPage <= 3) {
                                        endPage = Math.min(totalPages - 1, 4);
                                    }
                                    // Adjust if near end
                                    if (currentPage >= totalPages - 2) {
                                        startPage = Math.max(2, totalPages - 3);
                                    }

                                    // Ellipsis after first
                                    if (startPage > 2) {
                                        pageNumbers.push('...');
                                    }

                                    // Middle pages
                                    for (let i = startPage; i <= endPage; i++) {
                                        pageNumbers.push(i);
                                    }

                                    // Ellipsis before last
                                    if (endPage < totalPages - 1) {
                                        pageNumbers.push('...');
                                    }

                                    // Always show last
                                    pageNumbers.push(totalPages);
                                }

                                return pageNumbers.map((number, index) => (
                                    <button
                                        key={index}
                                        className={`page-btn ${number === currentPage ? 'active' : ''} ${number === '...' ? 'ellipsis' : ''}`}
                                        onClick={() => number !== '...' && paginate(number)}
                                        disabled={number === '...'}
                                    >
                                        {number}
                                    </button>
                                ));
                            })()}
                        </div>

                        <button
                            className="page-btn nav-btn"
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
