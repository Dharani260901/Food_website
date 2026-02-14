import 'dotenv/config';
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import chatRouter from "./routes/chatRoute.js";
import deliveryRouter from "./routes/deliveryRoute.js";
import { createServer } from "http";
import { Server } from "socket.io";

// app config
const app = express();
const port = 4000;

// middleware
app.use(express.json());
app.use(cors());

// DB connection
connectDB();

// routes
app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/chatbot", chatRouter);
app.use("/api/delivery", deliveryRouter);

app.get("/", (req, res) => {
  res.send("API Working!");
});

// ✅ CORRECT SOCKET SERVER SETUP
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// SOCKET EVENTS
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinOrder", (orderId) => {
    socket.join(orderId);
    console.log(`Joined order room: ${orderId}`);
  });

  socket.on("driverLocation", ({ orderId, lat, lng }) => {
    if (!orderId || !lat || !lng) return;
    io.to(orderId).emit("locationUpdate", { lat, lng });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
});

server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
