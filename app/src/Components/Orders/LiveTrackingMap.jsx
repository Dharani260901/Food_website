import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet/dist/leaflet.css";
import io from "socket.io-client";

// ✅ Internal component to fix the "Blank Map" issue
const MapRecenter = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            setTimeout(() => {
                map.invalidateSize(); // Fixes the "Grey Box" issue
                map.setView(center, 15);
            }, 400);
        }
    }, [center, map]);
    return null;
};

const RoutingLayer = ({ driverPos, customerPos, setDistanceInfo }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!map || !driverPos || !customerPos) return;
        if (routingControlRef.current) map.removeControl(routingControlRef.current);

        const control = L.Routing.control({
            waypoints: [L.latLng(driverPos[0], driverPos[1]), L.latLng(customerPos[0], customerPos[1])],
            lineOptions: { styles: [{ color: "#ff4500", weight: 6 }] },
            createMarker: (i, wp) => {
                const icon = L.icon({
                    iconUrl: i === 0 ? "https://cdn-icons-png.flaticon.com/512/3198/3198336.png" : "https://cdn-icons-png.flaticon.com/512/1239/1239525.png",
                    iconSize: [35, 35], iconAnchor: [17, 35]
                });
                return L.marker(wp.latLng, { icon });
            },
            addWaypoints: false, draggableWaypoints: false, show: false
        }).addTo(map);

        control.on('routesfound', (e) => {
            const summary = e.routes[0].summary;
            setDistanceInfo({ km: (summary.totalDistance / 1000).toFixed(2), mins: Math.round(summary.totalTime / 60) });
        });

        routingControlRef.current = control;
        return () => map.removeControl(control);
    }, [map, driverPos, customerPos]);

    return null;
};

const LiveTrackingMap = ({ customerLocation, orderId }) => {
    // Starting driver position (you can change this to a restaurant location)
    const [driverLocation, setDriverLocation] = useState([11.0168, 76.9558]);
    const [info, setInfo] = useState({ km: 0, mins: 0 });

    useEffect(() => {
        if (!orderId) return;
        const socket = io("http://localhost:4000");
        socket.emit("joinOrder", orderId);
        ocket.on("locationUpdate", (data) => setDriverLocation([data.lat, data.lng]));
        return () => socket.disconnect();
    }, [orderId]);

    return (
        <div style={{ position: "relative", height: "450px", width: "100%", borderRadius: "12px", overflow: "hidden" }}>
            {/* Overlay UI */}
            <div style={{
                position: "absolute", top: "15px", left: "50%", transform: "translateX(-50%)",
                zIndex: 1000, background: "white", padding: "10px 25px", borderRadius: "50px",
                boxShadow: "0px 4px 15px rgba(0,0,0,0.15)", display: "flex", gap: "20px", fontWeight: "bold"
            }}>
                <span style={{ color: "#ff4500" }}>🚴 {info.km} km away</span>
                <span style={{ color: "#333" }}>⏱️ {info.mins} mins</span>
            </div>

            <MapContainer center={customerLocation} zoom={15} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapRecenter center={customerLocation} />
                <RoutingLayer driverPos={driverLocation} customerPos={customerLocation} setDistanceInfo={setInfo} />
            </MapContainer>
        </div>
    );
};

export default LiveTrackingMap;