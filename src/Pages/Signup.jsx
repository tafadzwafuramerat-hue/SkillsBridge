import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Account created successfully! Please check your email to confirm your account.");

    navigate("/login");
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          Skill<span>Bridge</span>
        </div>

        <h1>Create your account</h1>

        <p className="auth-subtitle">
          Start discovering opportunities that match your skills.
        </p>

        <form onSubmit={handleSignup}>

          <label>Full Name</label>

          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="auth-button"
          >
            Create Account
          </button>

        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">
            Log in
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Signup;