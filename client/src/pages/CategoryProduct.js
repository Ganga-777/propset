import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";
import { Tooltip, Select, Slider } from "antd";
import "../styles/CategoryProduct.css";

const { Option } = Select;

const CategoryProduct = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Filters and Sorting
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  useEffect(() => {
    if (params?.slug) getProductsByCategory();
  }, [params?.slug]);

  const getProductsByCategory = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:8081/api/v1/product/product-category/${params.slug}`
      );
      setProducts(data?.products);
      setCategory(data?.category);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(p => {
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      const matchesStock = inStockOnly ? p.quantity > 0 : true;
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
      return matchesPrice && matchesStock && matchesBrand;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  const handleAddToCart = (product) => {
    if (product.quantity <= 0) {
      toast.error("Product is out of stock");
      return;
    }
    setCart([...cart, product]);
    localStorage.setItem("cart", JSON.stringify([...cart, product]));
    toast.success("Item added to cart");
  };

  // Get unique brands from products
  const brands = [...new Set(products.map(p => p.brand))].filter(Boolean);

  return (
    <Layout>
      <div className="category-products-container">
        {/* Category Header */}
        <div className="category-header">
          <div className="category-info">
            <h1>{category?.name}</h1>
            <p>{category?.description || `Explore our ${category?.name} collection`}</p>
          </div>
          
          <div className="category-stats">
            <div className="stat">
              <i className="fas fa-box"></i>
              <span>{filteredProducts.length} Products</span>
            </div>
            <div className="stat">
              <i className="fas fa-check-circle"></i>
              <span>{products.filter(p => p.quantity > 0).length} In Stock</span>
            </div>
          </div>
        </div>

        <div className="category-content">
          {/* Filters Sidebar */}
          <div className="filters-sidebar">
            <div className="filter-section">
              <h3>Sort By</h3>
              <Select
                defaultValue="newest"
                style={{ width: '100%' }}
                onChange={value => setSortBy(value)}
              >
                <Option value="newest">Newest First</Option>
                <Option value="price-low">Price: Low to High</Option>
                <Option value="price-high">Price: High to Low</Option>
                <Option value="name-asc">Name: A to Z</Option>
                <Option value="name-desc">Name: Z to A</Option>
              </Select>
            </div>

            <div className="filter-section">
              <h3>Price Range</h3>
              <Slider
                range
                min={0}
                max={10000}
                defaultValue={priceRange}
                onChange={value => setPriceRange(value)}
                tipFormatter={value => `₹${value}`}
              />
              <div className="price-inputs">
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
              </div>
            </div>

            <div className="filter-section">
              <h3>Brands</h3>
              <div className="brand-filters">
                {brands.map(brand => (
                  <label key={brand} className="brand-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedBrands([...selectedBrands, brand]);
                        } else {
                          setSelectedBrands(selectedBrands.filter(b => b !== brand));
                        }
                      }}
                    />
                    {brand}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <label className="stock-toggle">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => setInStockOnly(e.target.checked)}
                />
                Show In-Stock Only
              </label>
            </div>
          </div>

          {/* Products Section */}
          <div className="products-section">
            {/* View Controls */}
            <div className="view-controls">
              <div className="view-buttons">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <i className="fas fa-th"></i>
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
              <span className="results-count">
                Showing {filteredProducts.length} products
              </span>
            </div>

            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : (
              <div className={`products-grid ${viewMode}`}>
                {filteredProducts.map((p) => (
                  <div className="product-card" key={p._id}>
                    {p.quantity <= 5 && p.quantity > 0 && (
                      <span className="low-stock-badge">Low Stock</span>
                    )}
                    
                    <div className="product-image-container">
                      <img
                        src={`http://localhost:8081/api/v1/product/product-photo/${p._id}`}
                        alt={p.name}
                        className="product-img"
                        loading="lazy"
                      />
                      <div className="product-actions">
                        <Tooltip title="Quick View">
                          <button
                            className="action-btn"
                            onClick={() => setSelectedProduct(p)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </Tooltip>
                        <Tooltip title="View Details">
                          <button
                            className="action-btn"
                            onClick={() => navigate(`/product/${p.slug}`)}
                          >
                            <i className="fas fa-info-circle"></i>
                          </button>
                        </Tooltip>
                        <Tooltip title={p.quantity <= 0 ? "Out of Stock" : "Add to Cart"}>
                          <button
                            className="action-btn"
                            onClick={() => handleAddToCart(p)}
                            disabled={p.quantity <= 0}
                          >
                            <i className="fas fa-shopping-cart"></i>
                          </button>
                        </Tooltip>
                      </div>
                    </div>

                    <div className="product-info">
                      <h3 className="product-name">{p.name}</h3>
                      <p className="product-description">
                        {p.description.substring(0, 100)}...
                      </p>
                      
                      <div className="product-meta">
                        <span className="product-price">₹{p.price.toLocaleString('en-IN')}</span>
                        <span className={`stock-status ${p.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                          {p.quantity > 0 ? `In Stock (${p.quantity})` : "Out of Stock"}
                        </span>
                      </div>
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
        <div className="quick-view-modal" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedProduct(null)}>
              <i className="fas fa-times"></i>
            </button>
            
            <div className="modal-body">
              <div className="modal-image">
                <img
                  src={`http://localhost:8081/api/v1/product/product-photo/${selectedProduct._id}`}
                  alt={selectedProduct.name}
                />
              </div>
              
              <div className="modal-info">
                <h2>{selectedProduct.name}</h2>
                <p className="modal-description">{selectedProduct.description}</p>
                
                <div className="modal-price-stock">
                  <span className="modal-price">
                    ₹{selectedProduct.price.toLocaleString('en-IN')}
                  </span>
                  <span className={`modal-stock ${selectedProduct.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {selectedProduct.quantity > 0 
                      ? `In Stock (${selectedProduct.quantity})` 
                      : "Out of Stock"}
                  </span>
                </div>
                
                <div className="modal-actions">
                  <button
                    className="modal-cart-btn"
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    disabled={selectedProduct.quantity <= 0}
                  >
                    {selectedProduct.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                  <button
                    className="modal-view-btn"
                    onClick={() => {
                      navigate(`/product/${selectedProduct.slug}`);
                      setSelectedProduct(null);
                    }}
                  >
                    View Full Details
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

export default CategoryProduct;