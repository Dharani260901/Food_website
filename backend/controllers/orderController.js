import OrderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173";

  try {
    const newOrder = new OrderModel({
    userId: req.body.userId, 
    items: req.body.items,   
    amount: req.body.amount, 
    address: req.body.address,
});

const savedOrder = await newOrder.save();
console.log("ORDER SAVED SUCCESSFULLY:", savedOrder._id); // Add this line


    // FIX: Ensure you map 'req.body.items'
    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: { name: item.name },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: "inr",
        product_data: { name: "Delivery Charges" },
        unit_amount: 200, // 2.00 INR
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
        console.log("Order Placement Error:", error);
        res.json({ success: false, message: "Error placing order" });
    }
};

const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body; 
  try {
    if (success === "true") {
      await OrderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Paid" });
    } else {
      await OrderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const userOrders = async (req,res) =>{
  try {
        
        const orders = await OrderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching orders" });
    }
}

const listOrders = async (req, res) => {
  try{
    const orders = await OrderModel.find({})
    res.json({ success: true, data: orders });


  }catch(error){
    console.log(error);
    res.json({ success: false, message: "Error fetching all orders" });
  }

}

const updateStatus = async ( req,res)=>{
  try{
    await OrderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status})
    res.json({success:true,message:"Status Updated"})
  }catch(error){
    console.log(error)
    res.json({success:false,message:"Error"})
  }

}

const updateLocation = async (req, res) => {
  try {
    const { orderId, lat, lng } = req.body;
    // We must update the nested fields inside the address object
    await OrderModel.findByIdAndUpdate(
      orderId,
      { 
        "address.lat": lat, 
        "address.lng": lng 
      },
      { new: true }
    );
    
    res.json({ success: true, message: "Location Updated" });
    
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Location Update Failed" });
  }
};

const assignOrder = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { 
            deliveryBoy: req.body.deliveryBoyId,
            status: "Out for delivery" 
        });
        res.json({ success: true, message: "Driver Assigned & Status Updated" });
    } catch (error) {
        res.json({ success: false, message: "Error assigning driver" });
    }
}





export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus,updateLocation,assignOrder };

