import deliveryModel from "../models/deliveryAgentModel.js";
import orderModel from "../models/orderModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Login Delivery Agent
const loginDelivery = async (req, res) => {
    const { email, password } = req.body;
    try {
        const deliveryBoy = await deliveryModel.findOne({ email });
        if (!deliveryBoy) {
            return res.json({ success: false, message: "Driver not found" });
        }

        const isMatch = await bcrypt.compare(password, deliveryBoy.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: deliveryBoy._id }, process.env.JWT_SECRET);
        res.json({ success: true, token, driverId: deliveryBoy._id, name: deliveryBoy.name });
    } catch (error) {
        res.json({ success: false, message: "Error logging in" });
    }
};

// Get Orders Assigned to specific Driver
const getMyOrders = async (req, res) => {
    const { driverId } = req.body;
    try {
        const orders = await orderModel.find({ deliveryBoy: driverId, status: "Out for delivery" });
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: "Error fetching orders" });
    }
};

// List all drivers (For Admin Panel Dropdown)
const listDrivers = async (req, res) => {
    try {
        const drivers = await deliveryModel.find({});
        res.json({ success: true, data: drivers });
    } catch (error) {
        res.json({ success: false, message: "Error fetching drivers" });
    }
};

// Assign delivery agent to an order (Admin action)
const assignDeliveryAgent = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { driverId } = req.body;

        await orderModel.findByIdAndUpdate(orderId, {
            deliveryBoy: driverId,
            status: "Out for delivery"
        });

        res.json({ success: true, message: "Delivery agent assigned successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to assign delivery agent" });
    }
};

export { loginDelivery, getMyOrders, listDrivers, assignDeliveryAgent };