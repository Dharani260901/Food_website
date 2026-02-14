export default function socketConfig(io){
  io.on("connection",(socket)=>{
    console.log("User Connected");

    socket.on("updateLocation",(data)=>{
      io.emit("locationUpdated",data);
    });
  });
}
