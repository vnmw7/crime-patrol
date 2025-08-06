import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { databases } from "../../lib/appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const REPORT_LOCATIONS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_REPORT_LOCATIONS_COLLECTION_ID;

const MapPage = () => {
  const bacolodCoords = [10.6767, 122.9563];
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, REPORT_LOCATIONS_COLLECTION_ID);
        setLocations(response.documents);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      }
    };

    fetchLocations();
  }, []);

  // Slightly offset markers that share very close coordinates
  const offsetCloseMarkers = (locations) => {
    const precision = 4; // round to ~11 meters
    const grouped = {};

    locations.forEach((loc) => {
      const lat = parseFloat(loc.latitude);
      const lng = parseFloat(loc.longitude);
      if (!lat || !lng) return;

      const key = `${lat.toFixed(precision)}_${lng.toFixed(precision)}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(loc);
    });

    const offsetDistance = 0.00005; // ~5 meters

    const newLocations = [];

    Object.values(grouped).forEach((group) => {
      if (group.length === 1) {
        newLocations.push(group[0]);
      } else {
        const angleStep = (2 * Math.PI) / group.length;
        group.forEach((loc, idx) => {
          const lat = parseFloat(loc.latitude);
          const lng = parseFloat(loc.longitude);

          const angle = idx * angleStep;
          const newLat = lat + offsetDistance * Math.cos(angle);
          const newLng = lng + offsetDistance * Math.sin(angle);

          newLocations.push({
            ...loc,
            latitude: newLat.toString(),
            longitude: newLng.toString(),
          });
        });
      }
    });

    return newLocations;
  };

  // Adjusted locations with offset applied
  const adjustedLocations = offsetCloseMarkers(locations);

  const getRandomColor = () =>
    `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;

  const createColoredIcon = (rgbColor) => {
    const svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
        <path fill="${rgbColor}" stroke="black" stroke-width="1" d="M12.5 0C7 0 2.5 4.5 2.5 10c0 9.5 10 31 10 31s10-21.5 10-31c0-5.5-4.5-10-10-10z"/>
        <circle cx="12.5" cy="10" r="5" fill="white" />
      </svg>
    `;

    return new L.DivIcon({
      html: svgIcon,
      className: "",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [0, -41],
    });
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-blue-500">Crime Map</h1>
        <h2 className="text-gray-300 text-sm mt-1">
          Real-time crime incidents in Bacolod City
        </h2>
      </div>

      {/* Map Container */}
      <div className="flex-1 p-4">
        <div className="w-full h-[calc(100vh-120px)] bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-xl">
          <MapContainer
            center={bacolodCoords}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
            className="rounded-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Pin for Bacolod center */}
            <Marker position={bacolodCoords}>
              <Popup>
                <div className="text-gray-800">
                  <strong>Bacolod City, Philippines</strong>
                  <br />
                  Crime Patrol Coverage Area
                </div>
              </Popup>
            </Marker>

            {/* Markers from Appwrite data */}
            {adjustedLocations.map((loc) => {
              const lat = parseFloat(loc.latitude);
              const lng = parseFloat(loc.longitude);

              if (!lat || !lng) return null;

              const icon = createColoredIcon(getRandomColor());

              return (
                <Marker key={loc.$id} position={[lat, lng]} icon={icon}>
                  <Popup>
                    <div className="text-gray-800 text-sm space-y-1">
                      <p><strong>Report ID:</strong> {loc.report_id || "N/A"}</p>
                      <p><strong>Address:</strong> {loc.location_address || "N/A"}</p>
                      <p><strong>Type:</strong> {loc.location_type || "N/A"}</p>
                      <p><strong>Details:</strong> {loc.location_details || "N/A"}</p>
                      <p><strong>Latitude:</strong> {loc.latitude}</p>
                      <p><strong>Longitude:</strong> {loc.longitude}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
