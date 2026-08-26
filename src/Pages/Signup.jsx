import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    // Create account in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // Create the user's profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          full_name: name,
          email: email,
          bio: "",
          location: "",
          skills: "",
        });

      if (profileError) {
        console.error(
          "Profile creation failed:",
          profileError
        );

        alert(
          "Account was created, but your profile could not be created."
        );

        setLoading(false);
        return;
      }
    }

    setLoading(false);

    alert(
      "Account created successfully! Please check your email to confirm your account."
    );

    navigate("/login");
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* LOGO */}

        <div className="auth-logo">
          Skill<span>Bridge</span>
        </div>


        {/* HEADER */}

        <h1>
          Create your account
        </h1>

        <p className="auth-subtitle">
          Start discovering opportunities
          that match your skills.
        </p>


        {/* FORM */}

        <form onSubmit={handleSignup}>

          {/* NAME */}

          <label>
            Full Name
          </label>

          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
          />


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
            required
          />


          {/* PASSWORD */}

          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />


          {/* SUBMIT */}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

        </form>


        {/* LOGIN LINK */}

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