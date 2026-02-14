import React, { useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/frontend/assets";
import { useContext } from "react";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken, setUserName } = useContext(StoreContext);

  const [currentState, setCurrentState] = useState("Sign Up");
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setData({ ...data, [name]: value });
  };

  const loginPopup = async (e) => {
    e.preventDefault();

    let newUrl = url;
    if (currentState === "Login") {
      newUrl += "/api/user/login";
    } else {
      newUrl += "/api/user/register";
    }

    try {
      const response = await axios.post(newUrl, data);

      if (response.data.success) {
        // 🕵️‍♂️ DEBUG: Open your browser console (F12) to see this output
        console.log("Server Response:", response.data);

        // ✅ Extracting Name Safely: 
        // Checks response.data.user.name OR response.data.name OR defaults to "User"
        const userNameFromAPI = response.data.user?.name || response.data.name || "User";

        setToken(response.data.token);
        setUserName(userNameFromAPI);

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userName", userNameFromAPI);

        setShowLogin(false);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Detailed Login Error:", error);
      alert("Error connecting to server. Please try again.");
    }
  };

  return (
    <div className="login-popup">
      <form onSubmit={loginPopup} className="login-popup-container">
        <div className="login-pop-title">
          <h2>{currentState}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt=""
          />
        </div>
        <div className="login-popup-inputs">
          {currentState === "Login" ? (
            <></>
          ) : (
            <input
              name="name"
              onChange={onChangeHandler}
              type="text"
              placeholder="Your name"
              value={data.name}
              required
            />
          )}
          <input
            name="email"
            onChange={onChangeHandler}
            type="email"
            placeholder="Your email"
            value={data.email}
            autoComplete="new-email"
            required
          />
          <input
            name="password"
            onChange={onChangeHandler}
            type="password"
            placeholder="Password"
            value={data.password}
            autoComplete="new-password"
            required
          />
        </div>
        <button type="submit">
          {currentState === "Sign Up" ? "Create account" : "Login"}
        </button>
        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, i agree to the terms of use & privacy policy.</p>
        </div>
        {currentState === "Login" ? (
          <p>
            Create a new account?{" "}
            <span onClick={() => setCurrentState("Sign Up")}>Click here</span>
          </p>
        ) : (
          <p>
            Already have an account?
            <span onClick={() => setCurrentState("Login")}>Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
