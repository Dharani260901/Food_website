export default function deliverySocket(io) {
  io.on("connection", (socket) => {
    console.log("Delivery socket connected:", socket.id);

    socket.on("joinOrder", (orderId) => {
      socket.join(orderId);
    });

    socket.on("driverLocation", (data) => {
      const { orderId, lat, lng } = data;
      if (!orderId || !lat || !lng) return;

      io.to(orderId).emit("locationUpdate", { lat, lng });
    });
  });
}
