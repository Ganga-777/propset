import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout/Layout";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";
import "../styles/ProductDetailsStyles.css";

const ProductDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [product, setProduct] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [selectedSimilarProduct, setSelectedSimilarProduct] = useState(null);

  // Get Product
  const getProduct = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:8081/api/v1/product/get-product/${params.slug}`
      );
      setProduct(data?.product);
      getSimilarProduct(data?.product._id, data?.product.category._id);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Similar Products
  const getSimilarProduct = async (pid, cid) => {
    try {
      const { data } = await axios.get(
        `http://localhost:8081/api/v1/product/related-product/${pid}/${cid}`
      );
      setRelatedProducts(data?.products);
    } catch (error) {
      console.log(error);
    }
  };

  // Initial details
  useEffect(() => {
    if (params?.slug) getProduct();
  }, [params?.slug]);

  // Add to cart
  const handleAddToCart = () => {
    if (quantity > product.quantity) {
      toast.error("Selected quantity exceeds available stock");
      return;
    }
    // Add multiple quantities of the same product
    const items = Array(quantity).fill(product);
    setCart([...cart, ...items]);
    localStorage.setItem("cart", JSON.stringify([...cart, ...items]));
    toast.success("Item added to cart");
  };

  return (
    <Layout>
      <div className="product-details-container">
        <div className="product-main">
          <div className="product-image-section">
            <img
              src={`http://localhost:8081/api/v1/product/product-photo/${product._id}`}
              alt={product.name}
              className="product-main-image"
            />
            {product.quantity <= 5 && product.quantity > 0 && (
              <span className="low-stock-badge">Low Stock</span>
            )}
          </div>

          <div className="product-info-section">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-meta">
              <div className="price-section">
                <span className="current-price">₹{product.price?.toLocaleString('en-IN')}</span>
                <div className="stock-info">
                  <i className={`fas fa-circle ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}></i>
                  <span>{product.quantity > 0 ? `In Stock (${product.quantity})` : "Out of Stock"}</span>
                </div>
              </div>
              
              <div className="rating-section">
                <div className="stars">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star-half-alt"></i>
                </div>
                <span className="rating-count">4.5 (120 reviews)</span>
              </div>
            </div>

            {product.quantity > 0 && (
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="qty-btn"
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <span className="qty-display">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    className="qty-btn"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button 
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.quantity <= 0}
              >
                <i className="fas fa-shopping-cart"></i>
                {product.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
              </button>
              <button className="buy-now-btn">
                <i className="fas fa-bolt"></i>
                Buy Now
              </button>
            </div>

            <div className="product-category">
              <span>Category: </span>
              <button 
                className="category-btn"
                onClick={() => navigate(`/category/${product?.category?.slug}`)}
              >
                {product?.category?.name}
              </button>
            </div>
          </div>
        </div>

        <div className="product-details-tabs">
          <div className="tabs-header">
            <button 
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button 
              className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              Shipping
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="description-content">
                <p>{product.description}</p>
              </div>
            )}
            {activeTab === 'details' && (
              <div className="details-content">
                <h3>Product Specifications</h3>
                <ul>
                  <li><strong>Brand:</strong> {product.brand}</li>
                  <li><strong>Model:</strong> {product.model}</li>
                  <li><strong>SKU:</strong> {product._id}</li>
                  <li><strong>Category:</strong> {product?.category?.name}</li>
                </ul>
              </div>
            )}
            {activeTab === 'shipping' && (
              <div className="shipping-content">
                <h3>Shipping Information</h3>
                <ul>
                  <li>Free delivery on orders above ₹499</li>
                  <li>Standard delivery: 3-5 business days</li>
                  <li>Express delivery available</li>
                  <li>Easy returns within 7 days</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Similar Products Section */}
        {relatedProducts.length > 0 && (
          <div className="similar-products-section">
            <h2>Similar Products</h2>
            <div className="similar-products-grid">
              {relatedProducts?.map((p) => (
                <div className="similar-product-card" key={p._id}>
                  <div className="similar-product-image-container">
                    <img
                      src={`http://localhost:8081/api/v1/product/product-photo/${p._id}`}
                      alt={p.name}
                      className="similar-product-img"
                      loading="lazy"
                    />
                    {p.quantity <= 5 && p.quantity > 0 && (
                      <span className="similar-stock-badge">Low Stock</span>
                    )}
                    <div className="similar-product-actions">
                      <button
                        className="similar-action-btn"
                        onClick={() => setSelectedSimilarProduct(p)}
                        title="Quick View"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        className="similar-action-btn"
                        onClick={() => navigate(`/product/${p.slug}`)}
                        title="View Details"
                      >
                        <i className="fas fa-info-circle"></i>
                      </button>
                      <button
                        className="similar-action-btn"
                        onClick={() => handleAddToCart(p)}
                        disabled={p.quantity <= 0}
                        title={p.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                      >
                        <i className="fas fa-shopping-cart"></i>
                      </button>
                    </div>
                  </div>

                  <div className="similar-product-info">
                    <h3 className="similar-product-name">{p.name}</h3>
                    <div className="similar-product-meta">
                      <div className="similar-price-rating">
                        <span className="similar-product-price">
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                        <div className="similar-product-rating">
                          <i className="fas fa-star"></i>
                          <span>4.5</span>
                        </div>
                      </div>
                      <span className="similar-stock-status">
                        {p.quantity > 0 ? `In Stock (${p.quantity})` : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick View Modal for Similar Products */}
        {selectedSimilarProduct && (
          <div className="quick-view-modal" onClick={() => setSelectedSimilarProduct(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button 
                className="modal-close-btn"
                onClick={() => setSelectedSimilarProduct(null)}
              >
                <i className="fas fa-times"></i>
              </button>
              
              <div className="modal-body">
                <div className="modal-image">
                  <img
                    src={`http://localhost:8081/api/v1/product/product-photo/${selectedSimilarProduct._id}`}
                    alt={selectedSimilarProduct.name}
                  />
                </div>
                
                <div className="modal-info">
                  <h2>{selectedSimilarProduct.name}</h2>
                  <div className="modal-price-stock">
                    <span className="modal-price">
                      ₹{selectedSimilarProduct.price.toLocaleString('en-IN')}
                    </span>
                    <span className={`modal-stock ${selectedSimilarProduct.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {selectedSimilarProduct.quantity > 0 
                        ? `In Stock (${selectedSimilarProduct.quantity})` 
                        : "Out of Stock"}
                    </span>
                  </div>
                  
                  <div className="modal-rating">
                    <div className="stars">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star-half-alt"></i>
                    </div>
                    <span>4.5 (120 reviews)</span>
                  </div>
                  
                  <p className="modal-description">
                    {selectedSimilarProduct.description}
                  </p>
                  
                  <div className="modal-actions">
                    <button
                      className="modal-cart-btn"
                      onClick={() => {
                        handleAddToCart(selectedSimilarProduct);
                        setSelectedSimilarProduct(null);
                      }}
                      disabled={selectedSimilarProduct.quantity <= 0}
                    >
                      <i className="fas fa-shopping-cart"></i>
                      {selectedSimilarProduct.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                    <button
                      className="modal-view-btn"
                      onClick={() => {
                        navigate(`/product/${selectedSimilarProduct.slug}`);
                        setSelectedSimilarProduct(null);
                      }}
                    >
                      <i className="fas fa-external-link-alt"></i>
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetails;