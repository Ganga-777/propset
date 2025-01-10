import React from 'react';
import { useCart } from '../../context/cart';

const CartItem = ({ product }) => {
  const { 
    removeFromCart, 
    updateQuantity, 
    formatCurrency 
  } = useCart();

  return (
    <div className="cart-item">
      <img 
        src={`/api/v1/product/product-photo/${product._id}`} 
        alt={product.name} 
      />
      <div className="cart-item-details">
        <h3>{product.name}</h3>
        <p>{formatCurrency(product.price)}</p>
        <div className="quantity-controls">
          <button 
            onClick={() => updateQuantity(product._id, (product.quantity || 1) - 1)}
          >
            -
          </button>
          <span>{product.quantity || 1}</span>
          <button 
            onClick={() => updateQuantity(product._id, (product.quantity || 1) + 1)}
          >
            +
          </button>
        </div>
        <button 
          className="remove-btn" 
          onClick={() => removeFromCart(product._id)}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem; 