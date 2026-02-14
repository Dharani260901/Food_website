import express from 'express';
import { addToCart, getCartItems, removeFromCart } from '../controllers/cartController.js';
import authMiddleware from "../middleware/auth.js";


const cartRouter = express.Router();

// Using .post for all to ensure compatibility with your current StoreContext logic
cartRouter.post('/add', authMiddleware, addToCart);
cartRouter.post('/remove', authMiddleware, removeFromCart);
cartRouter.post('/get', authMiddleware, getCartItems);

export default cartRouter;