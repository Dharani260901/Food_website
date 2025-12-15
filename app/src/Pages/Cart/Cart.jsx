import { useContext } from "react";
import "./Cart.css";
import { StoreContext } from "../../Context/StoreContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cartItems, food_list, removeFromCart,getTotalCart } = useContext(StoreContext);

  const navigate = useNavigate()

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
      </div>
      <hr />

      {food_list.map((item) => {
        if (cartItems[item._id] > 0) {
          return (
            <div>
              <div key={item._id} className="cart-items-title cart-items-item">
                <img src={item.image} alt="" />
                <p>{item.name}</p>
                <p>${item.price}</p>
                <p>{cartItems[item._id]}</p>
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
      })}
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCart()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${getTotalCart() === 0 ? 0 :2}</p>

            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${getTotalCart() === 0 ? 0: getTotalCart()+2}</b>

            </div>
            
          </div>
          <button onClick={()=>navigate('/order')}>PROCEED TO CHECKOUT</button>

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
