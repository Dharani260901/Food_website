import React from "react";
import { useParams } from "react-router-dom"; // ✅ Correct hook for /track-order/:orderId
import LiveTrackingMap from "../../components/Orders/LiveTrackingMap";
import './TrackOrder.css';

export default function TrackOrderPage() {
  // ✅ This extracts the 'orderId' directly from the URL path
  const { orderId } = useParams();

  return (
    <div className="track-order-container">
      <div className="track-order-header">
        <h2>Live Order Tracking</h2>
        <p>Order ID: <span className="order-id-text">#{orderId}</span></p>
      </div>

      {orderId ? (
        <div className="map-view-section">
          {/* ✅ Passing the orderId to your Map component for Socket logic */}
          <LiveTrackingMap orderId={orderId} />
        </div>
      ) : (
        <div className="error-message">
          <p>Invalid Order ID. Please go back to "My Orders" to track your food.</p>
        </div>
      )}
    </div>
  );
}