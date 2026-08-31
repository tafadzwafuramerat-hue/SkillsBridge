import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("job_seeker");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      alert("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    // Create Supabase Auth account
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          role: role,
        },
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // Create profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          full_name: cleanName,
          email: cleanEmail,
          role: role,
          bio: "",
          location: "",
          skills: "",
        });

      if (profileError) {
        console.error(
          "Profile error:",
          profileError
        );

        alert(
          `Account was created, but your profile could not be created: ${profileError.message}`
        );

        setLoading(false);
        return;
      }
    }

    setLoading(false);

    alert(
      "Account created successfully!"
    );

    navigate("/dashboard");
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
          />


          {/* ACCOUNT TYPE */}

          <label>
            I am joining SkillBridge as:
          </label>

          <div className="role-selection">

            <label className="role-option">

              <input
                type="radio"
                name="role"
                value="job_seeker"
                checked={role === "job_seeker"}
                onChange={(e) =>
                  setRole(e.target.value)
                }
              />

              <div>
                <strong>
                  Job Seeker
                </strong>

                <small>
                  Find jobs and apply for
                  opportunities.
                </small>
              </div>

            </label>


            <label className="role-option">

              <input
                type="radio"
                name="role"
                value="employer"
                checked={role === "employer"}
                onChange={(e) =>
                  setRole(e.target.value)
                }
              />

              <div>
                <strong>
                  Employer
                </strong>

                <small>
                  Post jobs and find talented
                  candidates.
                </small>
              </div>

            </label>

          </div>


          {/* SUBMIT */}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>


        {/* LOGIN */}

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