import express from "express";
import  {assignDeliveryAgent}  from "../controllers/deliveryController.js";
import adminAuth from "../middleware/auth.js";

const deliveryRouter = express.Router();

// Admin assigns delivery agent
deliveryRouter.put("/assign/:orderId", adminAuth, assignDeliveryAgent);

export default deliveryRouter;
