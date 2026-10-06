// Google Maps Configuration
export const GOOGLE_MAPS_CONFIG = {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,

    // Default map options
    defaultCenter: {
        lat: 28.6139, // New Delhi
        lng: 77.2090
    },

    defaultZoom: 12,

    // Map options
    mapOptions: {
        zoomControl: true,
        streetViewControl: true,
        mapTypeControl: true,
        fullscreenControl: true,
        gestureHandling: 'greedy',
    },

    // Libraries to load
    libraries: ['places', 'geometry'],

    // Place types for nearby search
    placeTypes: {
        restaurants: 'restaurant',
        cafes: 'cafe',
        gyms: 'gym',
        hospitals: 'hospital',
        banks: 'bank',
        atm: 'atm',
        parking: 'parking',
    },

    // Nearby search radius (in meters)
    nearbySearchRadius: 1000, // 1km

    // India bounds for autocomplete bias
    indiaBounds: {
        north: 35.5087,
        south: 6.7535,
        east: 97.3953,
        west: 68.1113,
    },
};

// Custom marker icons
export const MARKER_ICONS = {
    job: {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDIiIHZpZXdCb3g9IjAgMCAzMiA0MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgMEMxMC40NzcgMCA2IDQuNDc3IDYgMTBDNiAxNy41IDE2IDMyIDE2IDMyQzE2IDMyIDI2IDE3LjUgMjYgMTBDMjYgNC40NzcgMjEuNTIzIDAgMTYgMFoiIGZpbGw9IiMyOGE3NDUiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjEwIiByPSI1IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
        scaledSize: { width: 32, height: 42 },
    },
    restaurant: {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDIiIHZpZXdCb3g9IjAgMCAzMiA0MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgMEMxMC40NzcgMCA2IDQuNDc3IDYgMTBDNiAxNy41IDE2IDMyIDE2IDMyQzE2IDMyIDI2IDE3LjUgMjYgMTBDMjYgNC40NzcgMjEuNTIzIDAgMTYgMFoiIGZpbGw9IiNmZjU3MjIiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjEwIiByPSI1IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
        scaledSize: { width: 28, height: 38 },
    },
    selected: {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iNDYiIHZpZXdCb3g9IjAgMCAzNiA0NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTggMEMxMS4zNzMgMCA2IDUuMzczIDYgMTJDNiAyMSAxOCAzNiAxOCAzNkMxOCAzNiAzMCAyMSAzMCAxMkMzMCA1LjM3MyAyNC42MjcgMCAxOCAwWiIgZmlsbD0iIzY2N2VlYSIvPjxjaXJjbGUgY3g9IjE4IiBjeT0iMTIiIHI9IjYiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
        scaledSize: { width: 36, height: 46 },
    },
};

export default GOOGLE_MAPS_CONFIG;
