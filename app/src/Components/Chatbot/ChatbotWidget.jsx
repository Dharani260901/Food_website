import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./ChatbotWidget.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

export default function ChatbotWidget() {
  const { url, userName, token, addToCart } = useContext(StoreContext); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  // ✅ Automatically update the greeting when userName changes (Login/Logout)
  useEffect(() => {
    setMessages([
      {
        sender: "bot",
        text: `Hi ${userName}! How can I help you today? 😊`,
      },
    ]);
  }, [userName]);

const sendMessage = async () => {
    if (!input) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    try {
        const res = await axios.post(
            `${url}/api/chatbot/ask`,
            { message: input, name: userName },
            { headers: { token: token || localStorage.getItem("token") } }
        );

        const { reply, action, items } = res.data;
        
        // 1. Display the Bot's reply
        const botMsg = { sender: "bot", text: reply || "I'm not sure, please try again." };
        setMessages((prev) => [...prev, botMsg]);

        // 2. ✅ HANDLE THE CART REDIRECTION LOGIC
        if (action === "ADD_TO_CART_AND_PAY" && items) {
    items.forEach((item) => {
        // 'item.qty' comes from your bot backend (e.g., 2)
        for (let i = 0; i < item.qty; i++) {
            addToCart(item._id); 
        }
    });

    setTimeout(() => {
        setOpen(false);
        navigate("/cart");
    }, 2000);
}

    } catch (e) {
        console.error("Chatbot Error:", e);
        setMessages((prev) => [...prev, { sender: "bot", text: "Server error! Try again." }]);
    }
    setInput("");
};
  // Allow sending message with 'Enter' key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <>
      {open && (
        <div className="chatbot-box">
          <div className="chatbot-header">
            <span>🍔 Smart Food Chatbot</span>
            <button onClick={() => setOpen(false)} className="chatbot-close">
              ✖
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-msg ${
                  msg.sender === "user" ? "chat-user" : "chat-bot"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chatbot-input-area">
            <input
              className="chatbot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type message..."
            />
            <button className="chatbot-send" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button onClick={() => setOpen(true)} className="chatbot-fab">
        💬
      </button>
    </>
  );
}