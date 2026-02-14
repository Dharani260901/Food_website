// routes/chatRoute.js
import express from "express";
import { handleChatQuery} from "../controllers/chatController.js";

const router = express.Router();

router.post("/ask", handleChatQuery);

export default router;