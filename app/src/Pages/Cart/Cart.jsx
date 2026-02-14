import { useContext } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCart, url } = useContext(StoreContext);
  const navigate = useNavigate();
  const totalAmount = getTotalCart();

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />

        {/* Check if cart is empty */}
        {totalAmount === 0 ? (
          <div className="empty-cart-message">
            <p>Your cart is empty. Start chatting with our bot to add delicious food! 🍔</p>
          </div>
        ) : (
          food_list.map((item) => {
            // Check if this item is in the cartItems state
            if (cartItems[item._id] > 0) {
              return (
                <div key={item._id}>
                  <div className="cart-items-title cart-items-item">
                    <img src={url + "/images/" + item.image} alt={item.name} />
                    <p>{item.name}</p>
                    <p>${item.price}</p>
                    {/* This quantity comes directly from the cartItems state updated by the bot */}
                    <div className="cart-items-quantity">{cartItems[item._id]}</div>
                    <p>${item.price * cartItems[item._id]}</p>
                    <p
                      className="remove-btn"
                      onClick={() => removeFromCart(item._id)}
                    >
                      X
                    </p>
                  </div>
                  <hr />
                </div>
              );
            }
            return null;
          })
        )}
      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${totalAmount}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${totalAmount === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${totalAmount === 0 ? 0 : totalAmount + 2}</b>
            </div>
          </div>
          <button 
            disabled={totalAmount === 0} 
            onClick={() => navigate("/orders")}
            style={{ opacity: totalAmount === 0 ? 0.5 : 1, cursor: totalAmount === 0 ? "not-allowed" : "pointer" }}
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, Enter it here.</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder="promo code" />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;