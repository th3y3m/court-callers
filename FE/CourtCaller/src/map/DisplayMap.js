import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";
import RoutingMachine from './RoutingMachine';
import { getGeocodeFromAddress } from './GeocoderLocation';

function DisplayMap({ address }) {
  // Initialize userPosition and destination as null
  const [userPosition, setUserPosition] = useState(null);
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    if (address) {
      getGeocodeFromAddress(address)
        .then(result => setDestination(result))
        .catch(error => console.error(error));
    }
  }, [address]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        console.error("User location permission denied");
      }
    );
  }, []);

  // Default center for the map to prevent white screen when positions are null
  const defaultCenter = [10.875376656860935, 106.80076631184579];

  return (
    <MapContainer center={destination || defaultCenter} zoom={13} scrollWheelZoom={false}>      
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
      {userPosition && (
        <Marker position={userPosition} icon={originIcon}>
          <Popup>Your Location</Popup>
        </Marker>
      )}
      {destination && (
        <Marker position={destination} icon={destinationIcon}>
          <Popup>Branch Location</Popup>
        </Marker>
      )}

      {destination && <UpdateMapView position={destination || defaultCenter} />}
      {/* Conditional rendering of RoutingMachine */}
      {userPosition && destination && <RoutingMachine userPosition={userPosition} branchPosition={destination} />}
    </MapContainer>
  );
}

function UpdateMapView({ position }) {
  const map = useMap();
  if (position) {
    map.flyTo(position, 14);
  }
  return null;
}

const destinationIcon = L.icon({
  iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
});

const originIcon = L.icon({
  iconUrl: 'https://cdn3.iconfinder.com/data/icons/map-14/144/Map-10-512.png',
  iconSize: [60, 60],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
});


export default DisplayMap;
