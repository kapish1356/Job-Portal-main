import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GEOAPIFY_CONFIG, createCustomIcon } from '../config/geoapifyConfig';
import './GeoapifyMapComponent.css';

// Component to handle map bounds changes
const MapBoundsHandler = ({ onBoundsChange }) => {
    const map = useMap();

    useEffect(() => {
        const handleMoveEnd = () => {
            if (onBoundsChange) {
                const bounds = map.getBounds();
                onBoundsChange(bounds);
            }
        };

        map.on('moveend', handleMoveEnd);

        return () => {
            map.off('moveend', handleMoveEnd);
        };
    }, [map, onBoundsChange]);

    return null;
};

// Component to center map on searched location
const SearchLocationCentering = ({ searchedLocation }) => {
    const map = useMap();

    useEffect(() => {
        if (searchedLocation) {
            map.setView([searchedLocation.lat, searchedLocation.lng], 14, {
                animate: true,
                duration: 1,
            });
        }
    }, [searchedLocation, map]);

    return null;
};

// Component to auto-fit bounds when businesses change (only if no search)
const AutoFitBounds = ({ businesses, searchedLocation }) => {
    const map = useMap();

    useEffect(() => {
        // Don't auto-fit if there's a searched location
        if (searchedLocation) return;

        if (businesses && businesses.length > 0) {
            const validBusinesses = businesses.filter(b => b.location);

            if (validBusinesses.length > 0) {
                const bounds = L.latLngBounds(
                    validBusinesses.map(b => [b.location.lat, b.location.lng])
                );

                map.fitBounds(bounds, {
                    padding: [50, 50],
                    maxZoom: validBusinesses.length === 1 ? 50 : 13,
                });
            }
        }
    }, [businesses, searchedLocation, map]);

    return null;
};

// Component for custom pan controls (directional buttons)
const MapPanControls = () => {
    const map = useMap();

    const panMap = (direction) => {
        const panAmount = 100; // pixels to pan
        switch (direction) {
            case 'up':
                map.panBy([0, -panAmount]);
                break;
            case 'down':
                map.panBy([0, panAmount]);
                break;
            case 'left':
                map.panBy([-panAmount, 0]);
                break;
            case 'right':
                map.panBy([panAmount, 0]);
                break;
            default:
                break;
        }
    };

    return (
        <div className="map-pan-controls">
            <button
                className="pan-btn pan-up"
                onClick={() => panMap('up')}
                title="Pan Up"
                aria-label="Pan map up"
            >
                ↑
            </button>
            <div className="pan-horizontal">
                <button
                    className="pan-btn pan-left"
                    onClick={() => panMap('left')}
                    title="Pan Left"
                    aria-label="Pan map left"
                >
                    ←
                </button>
                <button
                    className="pan-btn pan-right"
                    onClick={() => panMap('right')}
                    title="Pan Right"
                    aria-label="Pan map right"
                >
                    →
                </button>
            </div>
            <button
                className="pan-btn pan-down"
                onClick={() => panMap('down')}
                title="Pan Down"
                aria-label="Pan map down"
            >
                ↓
            </button>
        </div>
    );
};

// Map Content Component
const MapContent = ({ businesses, searchedLocation, onBoundsChange, center, isFullscreen }) => {
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const tileUrl = GEOAPIFY_CONFIG.tileLayer.url.replace('{apiKey}', GEOAPIFY_CONFIG.apiKey);

    return (
        <MapContainer
            center={center}
            zoom={searchedLocation ? 14 : GEOAPIFY_CONFIG.defaultZoom}
            className="geoapify-map-container"
            scrollWheelZoom={true}
            zoomControl={false}
            maxZoom={50}
            minZoom={0}
            dragging={true}
            touchZoom={true}
            doubleClickZoom={true}
            boxZoom={true}
            keyboard={true}
            key={isFullscreen ? 'fullscreen' : 'normal'}
        >
            {/* Custom Zoom Control - Top Left */}
            <ZoomControl position="topleft" />

            {/* Tile Layer */}
            <TileLayer
                url={tileUrl}
                attribution={GEOAPIFY_CONFIG.tileLayer.attribution}
                maxZoom={50}
                maxNativeZoom={20}
            />

            {/* Search location centering */}
            <SearchLocationCentering searchedLocation={searchedLocation} />

            {/* Auto-fit bounds */}
            <AutoFitBounds businesses={businesses} searchedLocation={searchedLocation} />

            {/* Bounds change handler */}
            <MapBoundsHandler onBoundsChange={onBoundsChange} />

            {/* Pan Controls */}
            <MapPanControls />

            {/* Search Location Marker (Red Pin) */}
            {searchedLocation && (
                <Marker
                    position={[searchedLocation.lat, searchedLocation.lng]}
                    icon={createCustomIcon('📍', '#ef5350', 45)}
                >
                    <Popup className="custom-popup">
                        <div className="popup-content">
                            <h3>📍 Searched Location</h3>
                            <p className="popup-address">{searchedLocation.name}</p>
                        </div>
                    </Popup>
                </Marker>
            )}

            {/* Business Markers */}
            {businesses.map((business, index) => (
                business.location && (
                    <Marker
                        key={business._id || index}
                        position={[business.location.lat, business.location.lng]}
                        icon={createCustomIcon(
                            GEOAPIFY_CONFIG.markers.business.icon,
                            GEOAPIFY_CONFIG.markers.business.color,
                            GEOAPIFY_CONFIG.markers.business.size
                        )}
                        eventHandlers={{
                            click: () => setSelectedBusiness(business),
                        }}
                    >
                        <Popup
                            onClose={() => setSelectedBusiness(null)}
                            className="custom-popup"
                        >
                            <div className="popup-content">
                                <h3>{business.name}</h3>
                                <p className="popup-address">📍 {business.address}</p>
                                <span className="popup-badge">{business.type}</span>
                                {business.description && (
                                    <p className="popup-description">{business.description}</p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                )
            ))}
        </MapContainer>
    );
};

const GeoapifyMapComponent = ({ businesses = [], onBoundsChange, searchedLocation }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const wrapperRef = useRef(null);

    // Calculate center based on searched location or businesses
    const center = searchedLocation
        ? [searchedLocation.lat, searchedLocation.lng]
        : businesses.length > 0 && businesses[0]?.location
            ? [businesses[0].location.lat, businesses[0].location.lng]
            : [GEOAPIFY_CONFIG.defaultCenter.lat, GEOAPIFY_CONFIG.defaultCenter.lng];

    // Toggle fullscreen
    const toggleFullscreen = () => {
        console.log('🖥️ Toggling fullscreen. Current state:', isFullscreen);
        setIsFullscreen(!isFullscreen);
    };

    // Handle escape key to exit fullscreen
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isFullscreen]);

    // Check if API key is loaded
    useEffect(() => {
        console.log('🔑 Geoapify API Key:', GEOAPIFY_CONFIG.apiKey ? 'Loaded ✅' : 'Missing ❌');
        if (!GEOAPIFY_CONFIG.apiKey) {
            console.error('⚠️ API Key not found! Make sure .env file has VITE_GEOAPIFY_MAPS_API_KEY');
        }
    }, []);

    // Fullscreen content (rendered via portal)
    const fullscreenContent = isFullscreen && (
        <div className="geoapify-map-wrapper fullscreen">
            <button
                className="fullscreen-toggle-btn"
                onClick={toggleFullscreen}
                title="Exit Fullscreen (ESC)"
            >
                ✕
            </button>

            {!GEOAPIFY_CONFIG.apiKey ? (
                <div className="map-error">
                    <h3>⚠️ Geoapify API Key Missing</h3>
                    <p>Please add VITE_GEOAPIFY_MAPS_API_KEY to your .env file</p>
                </div>
            ) : (
                <MapContent
                    businesses={businesses}
                    searchedLocation={searchedLocation}
                    onBoundsChange={onBoundsChange}
                    center={center}
                    isFullscreen={true}
                />
            )}
        </div>
    );

    return (
        <>
            {/* Normal map view */}
            <div ref={wrapperRef} className="geoapify-map-wrapper">
                <button
                    className="fullscreen-toggle-btn"
                    onClick={toggleFullscreen}
                    title="Enter Fullscreen"
                >
                    ⛶
                </button>

                {!GEOAPIFY_CONFIG.apiKey ? (
                    <div className="map-error">
                        <h3>⚠️ Geoapify API Key Missing</h3>
                        <p>Please add VITE_GEOAPIFY_MAPS_API_KEY to your .env file</p>
                    </div>
                ) : (
                    <MapContent
                        businesses={businesses}
                        searchedLocation={searchedLocation}
                        onBoundsChange={onBoundsChange}
                        center={center}
                        isFullscreen={false}
                    />
                )}
            </div>

            {/* Fullscreen map (rendered via portal to body) */}
            {isFullscreen && createPortal(fullscreenContent, document.body)}
        </>
    );
};

export default GeoapifyMapComponent;
