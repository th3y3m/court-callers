import L from 'leaflet';
import 'leaflet-control-geocoder'; // Ensure you have this or a similar plugin

const getGeocodeFromAddress = async (address) => {
  return new Promise((resolve, reject) => {
    if (!address) {
      reject("Address is required");
    }

    const geocoder = L.Control.Geocoder.nominatim();
    geocoder.geocode(address, (results) => {
      if (results.length > 0 && results[0].center) {
        const { center } = results[0];
        if (center && 'lat' in center && 'lng' in center) {
          resolve(center); // Resolve with the geocode
        } else {
          reject("Invalid center object");
        }
      } else {
        reject("Address not found");
      }
    });
  });
};

export { getGeocodeFromAddress };