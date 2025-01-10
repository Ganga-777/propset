import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";
import "../styles/Homepage.css";
import { Checkbox, Radio } from "antd";
import { Prices } from "../components/Prices";

const HomePage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Get all categories
  const getAllCategories = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Get all products
  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/v1/product/get-product");
      if (data?.success) {
        setProducts(data.products);
        setTotal(data.total);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // Filter by category
  const handleFilter = async (value, id) => {
    let all = [...checked];
    if (value) {
      all.push(id);
    } else {
      all = all.filter((c) => c !== id);
    }
    setChecked(all);
  };

  // Get filtered products
  const filterProduct = async () => {
    try {
      const { data } = await axios.post("/api/v1/product/product-filters", {
        checked,
        radio,
      });
      setProducts(data?.products);
    } catch (error) {
      console.log(error);
    }
  };

  // Lifecycle methods
  useEffect(() => {
    getAllCategories();
    if (!checked.length && !radio.length) getAllProducts();
  }, []);

  useEffect(() => {
    if (checked.length || radio.length) filterProduct();
  }, [checked, radio]);

  // Add this function for cart handling
  const handleAddToCart = (p) => {
    if (p.quantity <= 0) {
      toast.error("Product is out of stock");
      return;
    }
    setCart([...cart, p]);
    localStorage.setItem("cart", JSON.stringify([...cart, p]));
    toast.success("Item added to cart");
  };

  return (
    <Layout title={"All Products - Best Offers"}>
      <div className="homepage-container">
        {/* Filters Toggle Button (Mobile) */}
        <button 
          className="filter-toggle-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <i className="fas fa-filter"></i> Filters
        </button>

        <div className="home-page-layout">
          {/* Filter Section */}
          <div className={`filters ${showFilters ? 'show-filters' : ''}`}>
            <div className="filter-section">
              <h4>Filter By Category</h4>
              <div className="category-filters">
                {categories?.map((c) => (
                  <Checkbox
                    key={c._id}
                    onChange={(e) => handleFilter(e.target.checked, c._id)}
                  >
                    {c.name}
                  </Checkbox>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4>Filter By Price</h4>
              <div className="price-filters">
                <Radio.Group onChange={(e) => setRadio(e.target.value)}>
                  {Prices?.map((p) => (
                    <div key={p._id}>
                      <Radio value={p.array}>{p.name}</Radio>
                    </div>
                  ))}
                </Radio.Group>
              </div>
            </div>

            <div className="filter-section">
              <button
                className="reset-filter-btn"
                onClick={() => window.location.reload()}
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Products Section */}
          <div className="products-section">
            <div className="products-header">
              <h2>All Products ({total})</h2>
            </div>
            
            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : (
              <div className="products-grid">
                {products?.map((p) => (
                  <div className="product-card" key={p._id}>
                    <span className="low-stock-label">
                      {p.quantity <= 5 ? "Low Stock" : ""}
                    </span>
                    
                    <h3 className="product-name">{p.name}</h3>
                    
                    <div className="product-description">
                      About this item {p.description.substring(0, 60)}...
                    </div>

                    <div className="product-image-container">
                      <img
                        src={`/api/v1/product/product-photo/${p._id}`}
                        alt={p.name}
                        className="product-img"
                        loading="lazy"
                      />
                      <div className="product-actions">
                        <button
                          className="action-btn"
                          onClick={() => setSelectedProduct(p)}
                          title="Quick View"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => navigate(`/product/${p.slug}`)}
                          title="View Details"
                        >
                          <i className="fas fa-info-circle"></i>
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => handleAddToCart(p)}
                          disabled={p.quantity <= 0}
                          title={p.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                        >
                          <i className="fas fa-shopping-cart"></i>
                        </button>
                      </div>
                    </div>

                    <div className="product-meta">
                      <div className="price-rating">
                        <span className="price">₹{p.price.toLocaleString('en-IN')}</span>
                        <span className="rating">
                          <i className="fas fa-star"></i>
                          4.5
                        </span>
                      </div>
                    </div>

                    <div className="stock-status">
                      <span className={`stock-label ${p.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {p.quantity > 0 ? `In Stock (${p.quantity})` : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {selectedProduct && (
        <div className="quick-view-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setSelectedProduct(null)}>
              <i className="fas fa-times"></i>
            </button>
            <div className="modal-body">
              <div className="modal-image">
                <img
                  src={`/api/v1/product/product-photo/${selectedProduct._id}`}
                  alt={selectedProduct.name}
                />
              </div>
              <div className="modal-info">
                <h2>{selectedProduct.name}</h2>
                <p className="description">{selectedProduct.description}</p>
                <div className="price-stock">
                  <span className="modal-price">
                    ₹{selectedProduct.price.toLocaleString('en-IN')}
                  </span>
                  <span className={`stock-info ${selectedProduct.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {selectedProduct.quantity > 0 
                      ? `In Stock (${selectedProduct.quantity})` 
                      : "Out of Stock"}
                  </span>
                </div>
                <div className="modal-actions">
                  <button
                    className="add-to-cart-btn"
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    disabled={selectedProduct.quantity <= 0}
                  >
                    {selectedProduct.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                  <button
                    className="view-details-btn"
                    onClick={() => {
                      navigate(`/product/${selectedProduct.slug}`);
                      setSelectedProduct(null);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HomePage;