import React from 'react'
import './Orders.css'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from "../../assets/assets";

const Orders = ({ url }) => {

  const [orders, setOrders] = useState([])

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(url + '/api/orders/list')
      if (response.data.success) {
        setOrders(response.data.data)
      } else {
        toast.error("Error fetching orders")
      }
    } catch (error) {
      console.error(error);
      toast.error("Network Error")
    }
  }

  // Handle status update (Good practice to add this for Admin Panel)
  const statusHandler = async (event, orderId) => {
    const response = await axios.post(url + "/api/orders/status", {
      orderId,
      status: event.target.value
    })
    if (response.data.success) {
      await fetchAllOrders();
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [])

  return (
    <div className='order add'>
      <h3>Order Page</h3>
      <div className="order-list">
        {orders.map((order, index) => (
          <div key={index} className="order-item">
            <img src={assets.parcel_icon} alt="" />
            <div>
              <p className="order-item-food">
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return item.name + " x " + item.quantity
                  }
                  else {
                    return item.name + " x " + item.quantity + ", "
                  }
                })}
              </p>
              
              {/* FIX 1: Add optional chaining (?.) and check if address exists */}
              <p className="order-item-name">
                {order.address ? (order.address.firstName + " " + order.address.lastName) : "Unknown User"}
              </p>

              <div className="order-item-address">
                <p>{order.address?.street + ","}</p>
                {/* FIX 2: Corrected 'orders.address.country' to 'order.address.country' */}
                <p>{order.address?.city + ", " + order.address?.state + ", " + order.address?.country + ", " + order.address?.zipCode}</p>
              </div>
              <p className='order-item-phone'>{order.address?.phone}</p>
            </div>
            <p>Items: {order.items.length}</p>
            <p>${order.amount}</p>
            
            {/* Status Selector */}
            <select onChange={(event) => statusHandler(event, order._id)} value={order.status}>
              <option value="Food Processing">Food Processing</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders