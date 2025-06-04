import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "./MapPage.css";

const MapPage = () => {
  const bacolodCoords = [10.6767, 122.9563];

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-blue-500">Crime Map</h1>
        <p className="text-gray-300 text-sm mt-1">
          Real-time crime incidents in Bacolod City
        </p>
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
            <Marker position={bacolodCoords}>
              <Popup>
                <div className="text-gray-800">
                  <strong>Bacolod City, Philippines</strong>
                  <br />
                  Crime Patrol Coverage Area
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
