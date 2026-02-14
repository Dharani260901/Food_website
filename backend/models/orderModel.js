import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    deliveryAgentId: {
  type: String,
  default: null
},
currentLocation: {
  lat: { type: Number },
  lng: { type: Number }
}
,
    status: { type: String, default: "Food Processing" },
    date: { type: Date, default: Date.now() },
    payment: { type: Boolean, default: false },
    deliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: 'delivery', default: null } // NEW
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;