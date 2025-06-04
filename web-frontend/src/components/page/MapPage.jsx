import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import SidebarNav from '../Sidebar/Sidebar';
import './MapPage.css';

const MapPage = () => {
  const bacolodCoords = [10.6767, 122.9563];

  return (
    <div className="container">
      <SidebarNav />
      <main className="main-content">
        <MapContainer
          center={bacolodCoords}
          zoom={13}
          scrollWheelZoom={true}
          className="leaflet-container"
        >
          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={bacolodCoords}>
            <Popup>Bacolod City, Philippines</Popup>
          </Marker>
        </MapContainer>
      </main>
    </div>
  );
};

export default MapPage;
