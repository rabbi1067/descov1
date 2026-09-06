export interface DeviceCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  speed?: number | null;
  timestamp: number;
}

export interface TrackedLocationResult {
  coords: DeviceCoordinates;
  formattedAddress: string;
  shortAddress: string;
  source: 'gps_reverse_geocoded' | 'gps_coordinates_only';
  mapsUrl: string;
  details?: {
    road?: string;
    houseNumber?: string;
    suburb?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
}

/**
 * Reverse geocodes latitude & longitude using OpenStreetMap Nominatim
 */
async function reverseGeocode(lat: number, lon: number): Promise<{
  formatted: string;
  short: string;
  details: {
    road?: string;
    houseNumber?: string;
    suburb?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
} | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'en,bn',
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) return null;
    const data = await response.json();
    if (!data || !data.address) return null;

    const addr = data.address;
    const houseNumber = addr.house_number || addr.building || '';
    const road = addr.road || addr.street || addr.pedestrian || addr.footway || '';
    const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || addr.subdistrict || '';
    const city = addr.city || addr.town || addr.municipality || addr.city_district || addr.state_district || addr.state || '';
    const postcode = addr.postcode || '';
    const country = addr.country || 'Bangladesh';

    const parts: string[] = [];
    if (houseNumber) parts.push(`House/Building: ${houseNumber}`);
    if (road) parts.push(road);
    if (suburb) parts.push(suburb);
    if (city) parts.push(city);
    if (postcode) parts.push(postcode);
    if (country && !city.includes(country)) parts.push(country);

    const formatted = parts.length > 0 ? parts.join(', ') : (data.display_name || '');
    const short = [suburb || road, city].filter(Boolean).join(', ') || formatted.slice(0, 35);

    return {
      formatted,
      short,
      details: {
        houseNumber,
        road,
        suburb,
        city,
        postcode,
        country,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Tracks the device's real-time physical GPS coordinates with high accuracy
 * and resolves the exact street/area address.
 */
export function trackDeviceLocation(
  onProgress?: (status: string) => void
): Promise<TrackedLocationResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser or device.'));
      return;
    }

    onProgress?.('Accessing device GPS & positioning hardware...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: DeviceCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy || 0),
          altitude: position.coords.altitude,
          speed: position.coords.speed,
          timestamp: position.timestamp || Date.now(),
        };

        onProgress?.('Coordinates locked. Resolving street address & area...');

        const mapsUrl = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
        const geocoded = await reverseGeocode(coords.latitude, coords.longitude);

        if (geocoded && geocoded.formatted) {
          const formattedAddress = `${geocoded.formatted} (GPS: ${coords.latitude.toFixed(4)}°, ${coords.longitude.toFixed(4)}°, ±${coords.accuracy}m)`;
          resolve({
            coords,
            formattedAddress,
            shortAddress: geocoded.short,
            source: 'gps_reverse_geocoded',
            mapsUrl,
            details: geocoded.details,
          });
        } else {
          // Fallback if reverse geocoding server is unreachable or offline
          const formattedAddress = `Current Device Location (Lat: ${coords.latitude.toFixed(5)}°, Lon: ${coords.longitude.toFixed(5)}°, Accuracy: ±${coords.accuracy}m)`;
          resolve({
            coords,
            formattedAddress,
            shortAddress: `${coords.latitude.toFixed(3)}°, ${coords.longitude.toFixed(3)}°`,
            source: 'gps_coordinates_only',
            mapsUrl,
          });
        }
      },
      (error) => {
        let msg = 'Could not retrieve device location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Device location access was denied. Please allow location permissions in your browser or select an area below.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'GPS or network positioning signal is unavailable on your device.';
            break;
          case error.TIMEOUT:
            msg = 'Location tracking request timed out. Please try again.';
            break;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  });
}
