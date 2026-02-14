import React, { useState, useEffect, useContext } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/frontend/assets";
import LiveTrackingMap from "../../components/Orders/LiveTrackingMap";

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [trackOrder, setTrackOrder] = useState(null);

  const fetchOrders = async () => {
    const response = await axios.post(
      url + "/api/orders/userorders",
      {},
      { headers: { token } }
    );
    setData(response.data.data);
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  return (
    <div className="my-orders">
      <h2>My Orders</h2>

      {trackOrder && (
        <div className="tracking-modal-overlay">
          <div className="tracking-modal-content">
            <div className="modal-header">
              <h3>Tracking Delivery</h3>
              <button className="close-btn" onClick={() => setTrackOrder(null)}>
                Close
              </button>
            </div>
            {/* Check if address coordinates exist before rendering */}
            {trackOrder.address && trackOrder.address.lat ? (
              <LiveTrackingMap
                customerLocation={[
                  trackOrder.address.lat,
                  trackOrder.address.lng,
                ]}
                orderId={trackOrder._id}
              />
            ) : (
              <p>No GPS data for this order</p>
            )}
          </div>
        </div>
      )}

      <div className="container">
        {data.map((order, index) => (
          <div key={index} className="my-orders-order">
            <img src={assets.parcel_icon} alt="" />
            <p>
              {order.items.map((item, i) =>
                i === order.items.length - 1
                  ? `${item.name} X ${item.quantity}`
                  : `${item.name} X ${item.quantity}, `
              )}
            </p>
            <p>${order.amount}.00</p>
            <p>Items: {order.items.length}</p>
            <p>
              <span>&#x25cf;</span> <b>{order.status}</b>
            </p>
            <button onClick={() => setTrackOrder(order)}>Track Order</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
