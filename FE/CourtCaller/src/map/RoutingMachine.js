import React, { useEffect } from 'react'
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

function RoutingMachine({ userPosition, branchPosition }) {
  const map = useMap();

  useEffect(() => {

    L.Routing.control({
      waypoints: [L.latLng(userPosition), L.latLng(branchPosition)],
      lineOptions:{
        styles:[
          {
            color: "blue",
            weight: 6,
            opacity: 0.7,
          },
        ],
      },
      routeWhileDragging: false,
      geocoder: L.Control.Geocoder.nominatim(),
      addWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: true,
      draggableWaypoints: false,
      createMarker: function() { return null; } // Prevent automatic marker creation

    }).addTo(map);
  }, []);
  return null;
}

export default RoutingMachine;