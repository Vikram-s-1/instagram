import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./Signup.css";

function Signup() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      // Check if username is already taken
      const { data: existingUser, error: userCheckError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (userCheckError && userCheckError.code !== 'PGRST116') {
        console.error('Error checking username:', userCheckError);
        throw new Error('Error checking username availability');
      }

      if (existingUser) {
        setError('Username is already taken');
        return;
      }

      // Sign up with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
          }
        }
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

  console.log('User created successfully:', authData.user.id);

  // Profile creation is handled server-side by a DB trigger (see
  // `supabase/create_profile_trigger.sql`). This avoids race conditions
  // with auth.users and foreign-key constraints.

  // Redirect to login and ask the user to verify their email.

  // Show success message and delay redirect so user can see it
  setError("Registration successful! Please check your email for verification link.");
  setTimeout(() => navigate("/login"), 3000);
    } catch (error: any) {
      setError(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <div className="signup-container">
      <div className="signup-box">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
          alt="Instagram Logo"
          className="insta-logo"
        />
        <h2>Sign Up</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSignup} className="signup-form">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        <p className="login-text">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );

  return loading ? <div>Loading...</div> : renderForm();
}

export default Signup;
