import React, { useState, useEffect } from 'react';
import '../styles/Banner.css';

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      id: 1,
      image: '/images/banners/banner1.jpg',
      title: 'New Collection',
      description: 'Shop the latest trends'
    },
    {
      id: 2,
      image: '/images/banners/banner2.jpg',
      title: 'Special Offers',
      description: 'Up to 50% off'
    },
    {
      id: 3,
      image: '/images/banners/banner3.jpg',
      title: 'Premium Quality',
      description: 'Discover luxury items'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === banners.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide(currentSlide === banners.length - 1 ? 0 : currentSlide + 1);
  };

  const prevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? banners.length - 1 : currentSlide - 1);
  };

  return (
    <div className="banner-container">
      <div className="banner-slider">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
          >
            <img src={banner.image} alt={banner.title} />
            <div className="banner-content">
              <h2>{banner.title}</h2>
              <p>{banner.description}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="banner-btn prev" onClick={prevSlide}>❮</button>
      <button className="banner-btn next" onClick={nextSlide}>❯</button>
      <div className="banner-dots">
        {banners.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner; 