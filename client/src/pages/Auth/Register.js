import React, { useState } from "react";
import Layout from "../../components/Layout/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../../styles/Register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const navigate = useNavigate();

  // Form validation
  const [errors, setErrors] = useState({});
  
  const validateStep1 = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!phone.trim()) newErrors.phone = "Phone is required";
    if (!address.trim()) newErrors.address = "Address is required";
    if (!answer.trim()) newErrors.answer = "Security answer is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Password strength checker
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: "" };
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const labels = ["Weak", "Fair", "Good", "Strong"];
    return { strength, label: labels[strength - 1] || "" };
  };

  const handleNext = () => {
    if (validateStep1()) {
      setFormStep(2);
    }
  };

  const handleBack = () => {
    setFormStep(1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formStep === 1) {
      handleNext();
      return;
    }
    
    if (!validateStep2()) return;

    try {
      setLoading(true);
      const res = await axios.post("/api/v1/auth/register", {
        name,
        email,
        password,
        phone,
        address,
        answer,
      });
      
      if (res && res.data.success) {
        toast.success(res.data && res.data.message);
        navigate("/login");
      } else {
        toast.error(res.data.message);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength();

  return (
    <Layout title="Register - Ecommerce App">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1>Create Account</h1>
            <p>Join us to start shopping</p>
          </div>

          <div className="form-progress">
            <div className={`progress-step ${formStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Account</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${formStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Details</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {formStep === 1 ? (
              <div className="form-step">
                <div className="form-group">
                  <label htmlFor="name">
                    <i className="fas fa-user"></i> Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <i className="fas fa-envelope"></i> Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    <i className="fas fa-lock"></i> Password
                  </label>
                  <div className="password-input">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create password"
                      className={errors.password ? 'error' : ''}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {password && (
                    <div className="password-strength">
                      <div className="strength-bars">
                        {[...Array(4)].map((_, index) => (
                          <div
                            key={index}
                            className={`strength-bar ${index < passwordStrength.strength ? 'filled' : ''}`}
                          ></div>
                        ))}
                      </div>
                      <span className="strength-label">{passwordStrength.label}</span>
                    </div>
                  )}
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <button type="button" className="next-btn" onClick={handleNext}>
                  Next <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            ) : (
              <div className="form-step">
                <div className="form-group">
                  <label htmlFor="phone">
                    <i className="fas fa-phone"></i> Phone
                  </label>
                  <input
                    type="text"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone"
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="address">
                    <i className="fas fa-map-marker-alt"></i> Address
                  </label>
                  <textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your address"
                    className={errors.address ? 'error' : ''}
                  />
                  {errors.address && <span className="error-message">{errors.address}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="answer">
                    <i className="fas fa-shield-alt"></i> Security Question
                  </label>
                  <input
                    type="text"
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="What is your favorite sport?"
                    className={errors.answer ? 'error' : ''}
                  />
                  {errors.answer && <span className="error-message">{errors.answer}</span>}
                </div>

                <div className="form-buttons">
                  <button type="button" className="back-btn" onClick={handleBack}>
                    <i className="fas fa-arrow-left"></i> Back
                  </button>
                  <button type="submit" className="register-btn" disabled={loading}>
                    {loading ? (
                      <span className="loading-spinner"></span>
                    ) : (
                      <>Register <i className="fas fa-user-plus"></i></>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="register-footer">
            <p>Already have an account? <span onClick={() => navigate("/login")}>Login</span></p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;



