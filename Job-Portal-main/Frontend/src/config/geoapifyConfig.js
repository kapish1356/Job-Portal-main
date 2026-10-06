// Geoapify Maps Configuration
export const GEOAPIFY_CONFIG = {
    apiKey: import.meta.env.VITE_GEOAPIFY_MAPS_API_KEY,

    // Default map settings
    defaultCenter: { lat: 28.6139, lng: 77.2090 }, // New Delhi
    defaultZoom: 12,

    // Map tile layer
    tileLayer: {
        url: 'https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey={apiKey}',
        attribution: '© <a href="https://www.geoapify.com/">Geoapify</a> | © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 50,
    },

    // Geocoding API
    geocoding: {
        url: 'https://api.geoapify.com/v1/geocode/search',
        autocompleteUrl: 'https://api.geoapify.com/v1/geocode/autocomplete',
    },

    // Places API
    places: {
        url: 'https://api.geoapify.com/v2/places',
        categories: 'commercial.food_and_drink.restaurant',
        radius: 1000, // meters
    },

    // Marker icons (using emoji or custom icons)
    markers: {
        business: {
            icon: '💼',
            color: '#667eea',
            size: 40,
        },
        restaurant: {
            icon: '🍽️',
            color: '#f5576c',
            size: 35,
        },
        user: {
            icon: '📍',
            color: '#00d4aa',
            size: 35,
        },
    },
};

// Helper function to create custom marker icon
export const createCustomIcon = (emoji, color, size = 40) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                background: ${color};
                width: ${size}px;
                height: ${size}px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                border: 3px solid white;
            ">
                <span style="
                    transform: rotate(45deg);
                    font-size: ${size * 0.5}px;
                ">${emoji}</span>
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
    });
};

// Geocoding helper function
export const geocodeAddress = async (query) => {
    const url = `${GEOAPIFY_CONFIG.geocoding.url}?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_CONFIG.apiKey}&limit=5`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
            return data.features.map(feature => ({
                name: feature.properties.formatted,
                lat: feature.properties.lat,
                lon: feature.properties.lon,
                city: feature.properties.city,
                country: feature.properties.country,
            }));
        }
        return [];
    } catch (error) {
        console.error('Geocoding error:', error);
        return [];
    }
};

// Reverse geocoding helper
export const reverseGeocode = async (lat, lon) => {
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${GEOAPIFY_CONFIG.apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
            return data.features[0].properties.formatted;
        }
        return null;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
};
