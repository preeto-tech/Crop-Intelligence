/**
 * Utility for Geolocation and Reverse Geocoding
 */

export interface LocationData {
    city: string;
    latitude: number;
    longitude: number;
}

/**
 * Fetches the user's current city name based on browser geolocation
 */
export async function getCurrentCity(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Using OpenStreetMap Nominatim for free reverse geocoding
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
                    );
                    const data = await response.json();

                    const city = data.address.city ||
                        data.address.town ||
                        data.address.village ||
                        data.address.state_district ||
                        'Unknown City';

                    resolve({ city, latitude, longitude });
                } catch (error) {
                    console.error('Reverse geocoding failed:', error);
                    resolve({ city: 'Nagpur', latitude, longitude }); // Fallback to a default city
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                reject(error);
            },
            { enableHighAccuracy: true, timeout: 5001, maximumAge: 0 }
        );
    });
}
