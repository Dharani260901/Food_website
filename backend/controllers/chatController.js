import "dotenv/config";
import axios from "axios";
import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

/**
 * In-memory session store
 * key: user name (or Guest)
 * value: { step, items }
 */
let chatSessions = {};

/* ---------------- HELPER FUNCTION ---------------- */
const extractOrderItems = (message, foods) => {
  let items = [];
  const lowerMsg = message.toLowerCase();

  foods.forEach((food) => {
    const foodName = food.name.toLowerCase();
    // Regex to capture "2 blueberry cake" or "1 pasta"
    const regex = new RegExp(`(\\d+)\\s*${foodName}`);
    const match = lowerMsg.match(regex);

    if (match) {
      items.push({
        _id: food._id, // Essential for frontend addToCart logic
        name: food.name,
        qty: parseInt(match[1]),
        price: food.price,
      });
    }
  });

  return items;
};

/* ---------------- MAIN CONTROLLER ---------------- */
export const handleChatQuery = async (req, res) => {
  const { message, name } = req.body;
  const userKey = name || "Guest";
  const lowerMsg = message.toLowerCase();

  // Init session
  if (!chatSessions[userKey]) {
    chatSessions[userKey] = { step: "idle", items: [] };
  }
  const session = chatSessions[userKey];

  try {
    const foods = await foodModel.find({});

    /* 1️⃣ GREETING */
    const greetings = ["hi", "hello", "hey", "hola"];
    if (greetings.includes(lowerMsg)) {
      session.step = "greeted";
      const welcomeText = userKey !== "Guest" 
        ? `Hello ${userKey} 👋 Welcome back! I can help you add items to your cart. Would you like to see the menu?`
        : `Hello! 👋 Would you like to see the menu or place an order?`;

      return res.json({
        success: true,
        reply: welcomeText,
      });
    }

    /* 2️⃣ SHOW MENU */
    if (lowerMsg.includes("menu")) {
      const menu =
        foods.length > 0
          ? foods.map((f, i) => `${i + 1}. ${f.name} - ₹${f.price}`).join("\n")
          : "No menu available right now.";

      return res.json({
        success: true,
        reply: `Here’s our menu 🍽️:\n${menu}\n\nTell me what you’d like to add to your cart 😊`,
      });
    }

    /* 3️⃣ ORDER DETECTION & PRICE CALCULATION */
    if (session.step !== "confirm") {
      const detectedItems = extractOrderItems(lowerMsg, foods);

      if (detectedItems.length > 0) {
        session.step = "confirm";
        session.items = detectedItems;

        let total = 0;
        const summaryList = detectedItems.map((item) => {
          const itemTotal = item.qty * item.price;
          total += itemTotal;
          return `${item.qty} x ${item.name} (₹${itemTotal})`;
        });

        const summaryString = summaryList.join(", ");

        return res.json({
          success: true,
          reply: `You've selected: ${summaryString}.\n\n💰 **Total: ₹${total}**\n\nShall I add these to your cart and proceed to payment? (yes / no)`,
        });
      }
    }

    /* 4️⃣ CONFIRMATION (REWRITTEN FOR YOUR NEW FLOW) */
    if (session.step === "confirm") {
      if (lowerMsg === "yes" || lowerMsg === "confirm") {
        const itemsToCart = session.items;

        // Reset session
        chatSessions[userKey] = { step: "idle", items: [] };

        // We return an 'action' and 'items' so the frontend knows to update the cart
        return res.json({
          success: true,
          reply: "Great! 🛒 I've added those to your cart. Redirecting you to checkout now...",
          action: "ADD_TO_CART_AND_PAY", 
          items: itemsToCart
        });
      }

      if (lowerMsg === "no" || lowerMsg === "cancel") {
        chatSessions[userKey] = { step: "idle", items: [] };
        return res.json({
          success: true,
          reply: "No problem! Anything else from the menu you'd like?",
        });
      }
    }

    /* 5️⃣ AI FALLBACK */
    const menuForAI =
      foods.length > 0
        ? foods.map((f) => `${f.name} ₹${f.price}`).join("\n")
        : "No menu available.";

    const prompt = `
User Name: ${userKey}
User Message: ${message}

Menu:
${menuForAI}

Rules:
- Be friendly and short
- If user wants to order, guide them to specify quantity and item name.
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3.1-8b-instruct",
        messages: [
          { role: "system", content: "You are a smart food ordering assistant." },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:4000",
          "X-Title": "Food App Chatbot",
        },
      }
    );

    const reply = response.data.choices?.[0]?.message?.content || "Sorry, I didn’t understand that.";
    return res.json({ success: true, reply });

  } catch (err) {
    console.error(err);
    return res.json({
      success: true,
      reply: "AI service is busy right now. Please try again later.",
    });
  }
};

const getUserIdFromToken = async (req) => {
  const token = req.headers.token || req.headers.authorization;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
};