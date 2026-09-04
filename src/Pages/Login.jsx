import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      alert("Please enter your email and password.");
      return;
    }

    setLoading(true);

    // Sign in
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const currentUser = data.user;

    // Get user's profile and role
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .maybeSingle();

    if (profileError) {
      console.error(
        "Profile error:",
        profileError
      );

      alert(
        "We couldn't load your account type. Please try again."
      );

      setLoading(false);
      return;
    }

    const userRole = profile?.role || currentUser.user_metadata?.role || "job_seeker";

    setLoading(false);

    // Send user to the correct dashboard
    if (userRole === "employer") {
      navigate("/employer-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* LOGO */}

        <div className="auth-logo">
          Skill<span>Bridge</span>
        </div>


        {/* TITLE */}

        <h1>
          Welcome back
        </h1>

        <p className="auth-subtitle">
          Log in to continue your journey.
        </p>


        {/* FORM */}

        <form onSubmit={handleLogin}>

          {/* EMAIL */}

          <label>
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />


          {/* PASSWORD */}

          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Log In"}
          </button>

        </form>


        {/* SIGNUP */}

        <p className="auth-switch">

          Don't have an account?{" "}

          <Link to="/signup">
            Create one
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;