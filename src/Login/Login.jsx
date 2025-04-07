import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaFacebookF, FaGoogle, FaLinkedinIn, FaEnvelope, FaLock } from 'react-icons/fa';

export default function Auth() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    is_pharmacy: false,
    pharmacy_id: null
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoginView, setIsLoginView] = useState(true);

  // Handle input changes for both login and signup forms
  const handleInputChange = (e, isSignup = false) => {
    const { name, value } = e.target;
    if (isSignup) {
      setSignupData({ ...signupData, [name]: value });
    } else {
      setLoginData({ ...loginData, [name]: value });
    }
  };

  // Handle login form submission
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setMessage({ text: 'Verifying credentials...', type: 'info' });
  
    axios.get(`http://localhost:5000/users?email=${loginData.email}`)
      .then((response) => {
        const user = response.data[0]; // Get the first matching user
  
        if (user) {
          if (user.password === loginData.password) {
            // Store user data in local storage
            localStorage.setItem('user', JSON.stringify(user));
            setMessage({ text: "Login successful!", type: 'success' });
  
            setTimeout(() => {
              const redirectUrl = user.pharmacy_id ? `/pharmacy/${user.pharmacy_id}` : "/";
              console.log('Redirecting to:', redirectUrl);
              navigate(redirectUrl);
            }, 2000);
          } else {
            setMessage({ text: "Incorrect password. Please try again.", type: 'error' });
          }
        } else {
          setMessage({ text: "No account found with this email.", type: 'error' });
        }
      })
      .catch((error) => {
        console.error("Login error:", error);
        setMessage({ text: "An error occurred. Please try again later.", type: 'error' });
      });
  };
  

  // Handle sign-up form submission
  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setMessage({ text: 'Registering user...', type: 'info' });

    axios.post('http://localhost:5000/users', signupData)
      .then((response) => {
        setMessage({ text: "Registration successful!", type: 'success' });

        setTimeout(() => {
          setIsLoginView(true);
          setLoginData({ email: signupData.email, password: '' }); // Reset login form after successful registration
        }, 2000);
      })
      .catch((error) => {
        console.error("Signup error:", error);
        setMessage({ text: "An error occurred. Please try again later.", type: 'error' });
      });
  };

  return (
    <div className="auth-container">
      {/* Left side - Image */}
      <div className="auth-image-side">
        <img 
          src="https://export-download.canva.com/aVOXg/DAGjZWaVOXg/29/0/0001-504864310784479016.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUH5AO7UJ26%2F20250331%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250331T182837Z&X-Amz-Expires=91861&X-Amz-Signature=1d4aaa8ff766c4a90722913cc9304758a683d46ffa668e29b98cbc1acb23992a&X-Amz-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%2A%3DUTF-8%27%27H.png&response-expires=Tue%2C%2001%20Apr%202025%2019%3A59%3A38%20GMT" 
          alt="Pharmacy Service" 
          className="side-image" 
        />
      </div>

      {/* Right side - Form */}
      <div className="auth-form-side">
        {isLoginView ? (
          /* Login Form */
          <div className="auth-form">
            <h1>Login</h1>
            <div className="social-container">
              <a href="#" className="social"><FaFacebookF /></a>
              <a href="#" className="social"><FaGoogle /></a>
              <a href="#" className="social"><FaLinkedinIn /></a>
            </div>
            <span>or use your account</span>

            {message.text && (
              <div className={`message ${message.type}`}>{message.text}</div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div className="input-field">
                <FaEnvelope />
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={loginData.email}
                  onChange={(e) => handleInputChange(e)}
                  required
                />
              </div>
              <div className="input-field">
                <FaLock />
                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={loginData.password}
                  onChange={(e) => handleInputChange(e)}
                  required
                />
              </div>

              <a href="#" className="forgot-password">Forgot your password?</a>
              <button type="submit" className="auth-button">Sign In</button>
            </form>
            
            <div className="auth-switch">
              <p>Don't have an account?</p>
              <button onClick={() => setIsLoginView(false)} className="switch-button">Sign Up</button>
            </div>
          </div>
        ) : (
          /* Sign-up Form */
          <div className="auth-form">
            <h1>Sign Up</h1>

            {message.text && (
              <div className={`message ${message.type}`}>{message.text}</div>
            )}

            <form onSubmit={handleSignupSubmit}>
              <div className="input-field">
                <input
                  type="text"
                  placeholder="First Name"
                  name="first_name"
                  value={signupData.first_name}
                  onChange={(e) => handleInputChange(e, true)}
                  required
                />
              </div>
              <div className="input-field">
                <input
                  type="text"
                  placeholder="Last Name"
                  name="last_name"
                  value={signupData.last_name}
                  onChange={(e) => handleInputChange(e, true)}
                  required
                />
              </div>
              <div className="input-field">
                <FaEnvelope />
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={signupData.email}
                  onChange={(e) => handleInputChange(e, true)}
                  required
                />
              </div>
              <div className="input-field">
                <FaLock />
                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={signupData.password}
                  onChange={(e) => handleInputChange(e, true)}
                  required
                />
              </div>

              <div className="checkbox-field">
                <input
                  type="checkbox"
                  id="is_pharmacy"
                  name="is_pharmacy"
                  checked={signupData.is_pharmacy}
                  onChange={(e) => setSignupData({...signupData, is_pharmacy: e.target.checked})}
                />
                <label htmlFor="is_pharmacy">Is this a pharmacy account?</label>
              </div>

              {signupData.is_pharmacy && (
                <div className="input-field">
                  <input
                    type="text"
                    placeholder="Pharmacy ID"
                    name="pharmacy_id"
                    value={signupData.pharmacy_id}
                    onChange={(e) => handleInputChange(e, true)}
                    required
                  />
                </div>
              )}

              <button type="submit" className="auth-button">Sign Up</button>
            </form>
            
            <div className="auth-switch">
              <p>Already have an account?</p>
              <button onClick={() => setIsLoginView(true)} className="switch-button">Sign In</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}