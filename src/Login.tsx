import React from "react"; // Ensure React is imported
import { Link } from "react-router-dom"; // Import Link for navigation
import "./Login.css"; // Import your CSS file

function Login() {
  return (
    <div className="login-container">
      <div className="login-box">
        {/* Add the Instagram logo here */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
          alt="Instagram Logo"
          className="insta-logo"
        />
        <h2>Login</h2>
        <form className="login-form">
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">Log In</button>
        </form>
        <p className="signup-text">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;