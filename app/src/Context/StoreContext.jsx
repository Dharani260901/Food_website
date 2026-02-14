import React, { useState, createContext, useEffect } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);
  
  // ✅ ADDED: State for userName to be shared globally
  const [userName, setUserName] = useState("Guest");

  const url = "http://localhost:4000";

const addToCart = async (itemId) => {
  setCartItems((prev) => ({
    ...prev,
    [itemId]: (prev[itemId] || 0) + 1,
  }));

  const authToken = token || localStorage.getItem("token");

  if (authToken) {
    try {
      await axios.post(
        url + "/api/cart/add",
        { itemId },
        { headers: { token: authToken } }
      );
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  }
};


  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));

    if (token) {
      await axios.post(
        url + "/api/cart/remove",
        { itemId },
        { headers: { token } }
      );
    }
  };

  const getTotalCart = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    const response = await axios.get(url + "/api/food/list");
    setFoodList(response.data.data);
  };

  const loadCartData = async () => {
  const authToken = token || localStorage.getItem("token");

  if (!authToken) return; // 🚫 Prevent 403
    try {
    const response = await axios.post(
      url + "/api/cart/get",
      {},
      { headers: { token: authToken } }
    );
    setCartItems(response.data.cartData);
  } catch (error) {
    console.error("Error loading cart:", error);
  }
};

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();

      const storedToken = localStorage.getItem("token");
      const storedName = localStorage.getItem("userName");

      if (storedToken) {
  setToken(storedToken);
  if (storedName) {
    setUserName(storedName);
  }
  await loadCartData(); // token handled inside
}

    }
    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    addToCart,
    removeFromCart,
    setCartItems,
    getTotalCart,
    url,
    token,
    setToken,
    // ✅ ADDED: Export these to be used in Login and Chatbot
    userName,
    setUserName,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;