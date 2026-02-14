import React, { useContext, useState, useEffect } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet marker icon
const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const PlaceOrder = () => {
    const { getTotalCart, token, food_list, cartItems, url } = useContext(StoreContext);
    const navigate = useNavigate();
    const [mapLocation, setMapLocation] = useState({ lat: 11.0168, lng: 76.9558 });

    const [data, setData] = useState({
        firstName: "", lastName: "", email: "", street: "",
        city: "", state: "", zipCode: "", country: "", phone: "",
    });

    function LocationMarker() {
        useMapEvents({
            click(e) {
                setMapLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
            },
        });
        return mapLocation ? <Marker position={mapLocation} icon={markerIcon} /> : null;
    }

    function LocateControl() {
        const map = useMap();
        const handleLocate = () => {
            map.locate().on("locationfound", function (e) {
                setMapLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
                map.flyTo(e.latlng, 16); 
            }).on("locationerror", function () {
                alert("Location access denied.");
            });
        };

        return (
            // <div className="leaflet-top leaflet-right custom-locate-container">
            //     <div className="leaflet-control">
            //         <button type="button" className="locate-me-btn" onClick={handleLocate} style={{ padding: "10px", cursor: "pointer", fontSize: "18px" }}>
            //             🎯
            //         </button>
            //     </div>
            // </div>
            <>
            </>
        );
    }

    const onChangeHandler = (e) => {
        setData(data => ({ ...data, [e.target.name]: e.target.value }));
    };

    const placeOrderHandler = async (e) => {
        e.preventDefault();
        let orderItems = food_list.filter(item => cartItems[item._id] > 0)
                                  .map(item => ({ ...item, quantity: cartItems[item._id] }));

        let orderData = {
            address: { ...data, lat: mapLocation.lat, lng: mapLocation.lng },
            items: orderItems,
            amount: getTotalCart() + 2,
        };

        try {
            let response = await axios.post(url + "/api/orders/place", orderData, { headers: { token } });
            if (response.data.success) {
                window.location.replace(response.data.session_url);
            } else {
                alert("Error placing order.");
            }
        } catch (error) {
            alert("Payment connection error.");
        }
    };

    useEffect(() => {
        if (!token || getTotalCart() === 0) navigate("/cart");
    }, [token]);

    return (
        <form className="place-order" onSubmit={placeOrderHandler}>
            <div className="place-order-left">
                <p className="title">Delivery Information</p>
                <div className="multi-fields">
                    <input type="text" name="firstName" value={data.firstName} onChange={onChangeHandler} placeholder="First Name" required />
                    <input type="text" name="lastName" value={data.lastName} onChange={onChangeHandler} placeholder="Last Name" required />
                </div>
                <input type="email" name="email" value={data.email} onChange={onChangeHandler} placeholder="Email address" required />
                <input type="text" name="street" value={data.street} onChange={onChangeHandler} placeholder="Street" required />
                <div className="multi-fields">
                    <input type="text" name="city" value={data.city} onChange={onChangeHandler} placeholder="City Name" required />
                    <input type="text" name="state" value={data.state} onChange={onChangeHandler} placeholder="State" required />
                </div>
                <div className="multi-fields">
                    <input type="text" name="zipCode" value={data.zipCode} onChange={onChangeHandler} placeholder="Zip code" required />
                    <input type="text" name="country" value={data.country} onChange={onChangeHandler} placeholder="Country" required />
                </div>
                <input type="text" name="phone" value={data.phone} onChange={onChangeHandler} placeholder="Phone" required />
            </div>

            <div className="place-order-right">
                <div className="cart-total">
                    <h2>Cart Totals</h2>
                    <div className="cart-total-details"><p>Subtotal</p><p>${getTotalCart()}</p></div>
                    <hr /><div className="cart-total-details"><p>Delivery Fee</p><p>$2</p></div>
                    <hr /><div className="cart-total-details"><b>Total</b><b>${getTotalCart() + 2}</b></div>

                    <div className="map-container" style={{ height: '350px', width: '100%', margin: '25px 0', borderRadius: '15px', position: 'relative', overflow: 'hidden', border: '1px solid #ddd' }}>
                        <MapContainer center={[mapLocation.lat, mapLocation.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <LocationMarker />
                            <LocateControl />
                        </MapContainer>
                    </div>
                    <button type="submit">PROCEED TO PAYMENT</button>
                </div>
            </div>
        </form>
    );
};

export default PlaceOrder;