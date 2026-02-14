import { useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000"); // backend URL

const DeliveryDashboard = ({ orderId }) => {
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!orderId) return;

    // Join order-specific room
    socket.emit("joinOrder", orderId);

    if ("geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          console.log("📍 Sending GPS:", lat, lng);

          // Send GPS to backend
          socket.emit("driverLocation", {
            orderId,
            lat,
            lng,
          });
        },
        (error) => {
          console.error("GPS Error:", error.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        }
      );
    } else {
      alert("Geolocation not supported");
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [orderId]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>🚚 Delivery Tracking Active</h2>
      <p>GPS is being shared in real time</p>
    </div>
  );
};

export default DeliveryDashboard;
