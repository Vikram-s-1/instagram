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
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

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

      console.log('Attempting to create profile for user:', authData.user.id);
      
      // Double check the user ID
      console.log('Auth user ID:', authData.user.id);
      
      // Verify auth status
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);

      // Try to create the profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username,
          full_name: fullName,
          email,
          avatar_url: "",
          bio: "",
          website: ""
        })
        .select();  // Add this to see what's returned

      // Log everything for debugging
      console.log('Profile creation attempt:', {
        profileData,
        profileError,
        userId: authData.user.id,
        username,
        fullName,
        email
      });

      if (profileError) {
        console.error('Profile creation error details:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        });
        
        // Check if the profile already exists
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
          
        console.log('Existing profile check:', { existingProfile, checkError });

        // If profile creation fails, clean up
        await supabase.auth.signOut();
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }

      console.log('Profile created successfully');

      // Always redirect to login after signup since email verification is required
      navigate("/login");
      // Show success message
      setError("Registration successful! Please check your email for verification link.");
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
