import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
    name: {type:String, required:true},
    email: {type:String, required:true, unique:true},
    password: {type:String, required:true},
    isAvailable: {type:Boolean, default:true},
    deliveryBoy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "deliveryAgent",
    default: null
}

})
const deliveryModel = mongoose.models.deliveryAgent || mongoose.model("deliveryAgent", deliverySchema);
export default deliveryModel;