import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import axios from "axios";
import { Link } from "react-router-dom";
import { Tooltip, Badge } from "antd";
import "../styles/Categories.css";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [featuredProducts, setFeaturedProducts] = useState({});

  // Get all categories
  const getAllCategories = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) {
        // Add sample product counts and featured status
        const enrichedCategories = data.category.map(cat => ({
          ...cat,
          productCount: Math.floor(Math.random() * 100) + 1, // Sample count
          isFeatured: Math.random() > 0.5,
          trendingScore: Math.floor(Math.random() * 100) + 1
        }));
        setCategories(enrichedCategories);
        // Fetch featured products for each category
        enrichedCategories.forEach(cat => {
          getFeaturedProducts(cat._id);
        });
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // Get featured products (sample)
  const getFeaturedProducts = async (categoryId) => {
    // Simulated API call
    setFeaturedProducts(prev => ({
      ...prev,
      [categoryId]: [
        { id: 1, name: "Featured Product 1", price: 999 },
        { id: 2, name: "Featured Product 2", price: 1499 },
        { id: 3, name: "Featured Product 3", price: 799 },
      ]
    }));
  };

  useEffect(() => {
    getAllCategories();
  }, []);

  // Filter categories based on search and filter
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      activeFilter === "all" ? true :
      activeFilter === "featured" ? category.isFeatured :
      activeFilter === "trending" ? category.trendingScore > 70 : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <Layout title={"All Categories"}>
      <div className="categories-container">
        {/* Hero Section */}
        <div className="categories-hero">
          <h1>Explore Our Categories</h1>
          <p>Find everything you need, organized just for you</p>
          
          {/* Search and Filter Bar */}
          <div className="search-filter-bar">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-buttons">
              <button
                className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${activeFilter === 'featured' ? 'active' : ''}`}
                onClick={() => setActiveFilter('featured')}
              >
                Featured
              </button>
              <button
                className={`filter-btn ${activeFilter === 'trending' ? 'active' : ''}`}
                onClick={() => setActiveFilter('trending')}
              >
                Trending
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="categories-loading">
            <div className="loader"></div>
            <p>Discovering Categories for You...</p>
          </div>
        ) : (
          <>
            {/* Categories Stats */}
            <div className="categories-stats">
              <div className="stat-card">
                <i className="fas fa-th-large"></i>
                <h3>{categories.length}</h3>
                <p>Total Categories</p>
              </div>
              <div className="stat-card">
                <i className="fas fa-star"></i>
                <h3>{categories.filter(c => c.isFeatured).length}</h3>
                <p>Featured Categories</p>
              </div>
              <div className="stat-card">
                <i className="fas fa-fire"></i>
                <h3>{categories.filter(c => c.trendingScore > 70).length}</h3>
                <p>Trending Categories</p>
              </div>
            </div>

            {/* Categories Grid */}
            <div className="categories-grid">
              {filteredCategories.map((category) => (
                <div 
                  className="category-card" 
                  key={category._id}
                  onMouseEnter={() => setSelectedCategory(category._id)}
                  onMouseLeave={() => setSelectedCategory(null)}
                >
                  <div className="category-header">
                    <div className="category-icon">
                      <i className={`fas ${getCategoryIcon(category.name)}`}></i>
                    </div>
                    <div className="category-badges">
                      {category.isFeatured && (
                        <Tooltip title="Featured Category">
                          <Badge className="featured-badge">
                            <i className="fas fa-star"></i>
                          </Badge>
                        </Tooltip>
                      )}
                      {category.trendingScore > 70 && (
                        <Tooltip title="Trending Category">
                          <Badge className="trending-badge">
                            <i className="fas fa-fire"></i>
                          </Badge>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  
                  <div className="category-content">
                    <h3>{category.name}</h3>
                    <p>{category.description || `Explore our ${category.name} collection`}</p>
                    
                    <div className="category-meta">
                      <Tooltip title="Available Products">
                        <span className="product-count">
                          <i className="fas fa-box"></i>
                          {category.productCount} Products
                        </span>
                      </Tooltip>
                      <Tooltip title="Trending Score">
                        <span className="trending-score">
                          <i className="fas fa-chart-line"></i>
                          {category.trendingScore}%
                        </span>
                      </Tooltip>
                    </div>

                    {/* Featured Products Carousel */}
                    {featuredProducts[category._id] && (
                      <div className="featured-products-carousel">
                        <h4>Featured Products</h4>
                        <div className="carousel-items">
                          {featuredProducts[category._id].map(product => (
                            <div key={product.id} className="carousel-item">
                              <div className="product-placeholder"></div>
                              <p>{product.name}</p>
                              <span>₹{product.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={`category-actions ${selectedCategory === category._id ? 'show' : ''}`}>
                      <Link 
                        to={`/category/${category.slug}`}
                        className="view-products-btn"
                      >
                        <i className="fas fa-eye"></i>
                        View Products
                      </Link>
                      <button 
                        className="quick-view-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedCategory(category._id);
                        }}
                      >
                        <i className="fas fa-info-circle"></i>
                        Quick Info
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Category Benefits */}
            <div className="category-benefits">
              <div className="benefit-card">
                <i className="fas fa-truck"></i>
                <h3>Fast Delivery</h3>
                <p>Quick delivery across all categories</p>
              </div>
              <div className="benefit-card">
                <i className="fas fa-shield-alt"></i>
                <h3>Secure Shopping</h3>
                <p>Safe and secure shopping experience</p>
              </div>
              <div className="benefit-card">
                <i className="fas fa-undo"></i>
                <h3>Easy Returns</h3>
                <p>Hassle-free return policy</p>
              </div>
              <div className="benefit-card">
                <i className="fas fa-headset"></i>
                <h3>24/7 Support</h3>
                <p>Round the clock customer support</p>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

// Helper function for category icons
const getCategoryIcon = (categoryName) => {
  const icons = {
    Electronics: "fa-laptop",
    Fashion: "fa-tshirt",
    Books: "fa-book",
    Sports: "fa-futbol",
    Home: "fa-home",
    Beauty: "fa-spa",
    Toys: "fa-gamepad",
    Furniture: "fa-couch",
    Food: "fa-utensils",
    Health: "fa-heartbeat",
    // Add more mappings as needed
  };
  return icons[categoryName] || "fa-folder";
};

export default Categories;