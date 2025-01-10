import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import "../styles/CartPage.css";
import DropIn from "braintree-web-drop-in-react";

const CartPage = () => {
  const [auth] = useAuth();
  const [cart, setCart] = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [clientToken, setClientToken] = useState("");
  const [instance, setInstance] = useState("");
  
  // Group cart items by product ID
  const groupedCart = cart.reduce((acc, item) => {
    acc[item._id] = acc[item._id] || {
      ...item,
      quantity: 0,
    };
    acc[item._id].quantity += 1;
    return acc;
  }, {});

  // Calculate totals
  const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
  const shipping = subtotal > 499 ? 0 : 40;
  const total = subtotal + shipping - discount;

  // Remove cart item
  const removeCartItem = (pid) => {
    const updatedCart = cart.filter((item) => item._id !== pid);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Update quantity
  const updateQuantity = (pid, newQty) => {
    if (newQty < 1) return;
    const product = cart.find(item => item._id === pid);
    if (newQty > product.quantity) {
      toast.error("Cannot exceed available stock");
      return;
    }
    
    const currentQty = cart.filter(item => item._id === pid).length;
    if (newQty > currentQty) {
      // Add more items
      const toAdd = newQty - currentQty;
      const newCart = [...cart, ...Array(toAdd).fill(product)];
      setCart(newCart);
      localStorage.setItem("cart", JSON.stringify(newCart));
    } else {
      // Remove items
      const toRemove = currentQty - newQty;
      const newCart = [...cart];
      for (let i = 0; i < toRemove; i++) {
        const index = newCart.findLastIndex(item => item._id === pid);
        newCart.splice(index, 1);
      }
      setCart(newCart);
      localStorage.setItem("cart", JSON.stringify(newCart));
    }
  };

  // Apply coupon
  const applyCoupon = () => {
    if (couponCode.toLowerCase() === "first10") {
      const discountAmount = (subtotal * 0.1);
      setDiscount(discountAmount);
      toast.success("Coupon applied successfully!");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  // Get payment token
  const getToken = async () => {
    try {
      const { data } = await axios.get("/api/v1/product/braintree/token");
      setClientToken(data?.clientToken);
    } catch (error) {
      console.log(error);
    }
  };

  // Call getToken in useEffect
  useEffect(() => {
    getToken();
  }, [auth?.token]);

  // Handle payment
  const handlePayment = async () => {
    try {
      setLoading(true);
      const { nonce } = await instance.requestPaymentMethod();
      const { data } = await axios.post("/api/v1/product/braintree/payment", {
        nonce,
        cart,
      });
      setLoading(false);
      localStorage.removeItem("cart");
      setCart([]);
      navigate("/dashboard/user/orders");
      toast.success("Payment Completed Successfully");
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="cart-page-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p>{cart?.length} items in your cart</p>
        </div>

        {cart?.length > 0 ? (
          <div className="cart-content">
            <div className="cart-items">
              {Object.values(groupedCart).map((p) => (
                <div className="cart-item" key={p._id}>
                  <div className="item-image">
                    <img
                      src={`/api/v1/product/product-photo/${p._id}`}
                      alt={p.name}
                      loading="lazy"
                    />
                  </div>

                  <div className="item-details">
                    <h3>{p.name}</h3>
                    <p className="item-description">
                      {p.description.substring(0, 100)}...
                    </p>
                    
                    <div className="item-meta">
                      <span className="item-price">₹{p.price.toLocaleString('en-IN')}</span>
                      <span className={`stock-status ${p.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {p.quantity > 0 ? `${p.quantity} in stock` : "Out of Stock"}
                      </span>
                    </div>

                    <div className="item-actions">
                      <div className="quantity-controls">
                        <button 
                          onClick={() => updateQuantity(p._id, p.quantity - 1)}
                          className="qty-btn"
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                        <span className="quantity">{p.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(p._id, p.quantity + 1)}
                          className="qty-btn"
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeCartItem(p._id)}
                      >
                        <i className="fas fa-trash"></i>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-card">
                <h2>Order Summary</h2>
                
                <div className="summary-details">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                  </div>
                  {discount > 0 && (
                    <div className="summary-row discount">
                      <span>Discount</span>
                      <span>-₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="coupon-section">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button onClick={applyCoupon}>Apply</button>
                </div>

                <div className="payment-section">
                  <h3>Payment Method</h3>
                  {!clientToken || !cart?.length ? (
                    ""
                  ) : (
                    <>
                      <div className="payment-gateway">
                        <DropIn
                          options={{
                            authorization: clientToken,
                            paypal: {
                              flow: "vault",
                            },
                          }}
                          onInstance={(instance) => setInstance(instance)}
                        />
                      </div>
                      <button 
                        className="checkout-btn"
                        onClick={handlePayment}
                        disabled={loading || !instance}
                      >
                        {loading ? (
                          <span className="loading-spinner"></span>
                        ) : (
                          <>
                            <i className="fas fa-lock"></i>
                            {auth?.token ? "Pay Now" : "Login to Checkout"}
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="secure-shopping">
                <i className="fas fa-shield-alt"></i>
                <div>
                  <h4>Secure Shopping</h4>
                  <p>Your payment information is processed securely.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-cart">
            <i className="fas fa-shopping-cart"></i>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <button 
              className="continue-shopping"
              onClick={() => navigate("/")}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;