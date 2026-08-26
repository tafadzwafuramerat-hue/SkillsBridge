import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Navbar() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    navigate("/");
  };

  return (
    <nav className="navbar">

      {/* Logo */}
      <Link to="/" className="navbar-logo">
        Skill<span>Bridge</span>
      </Link>

      {/* Navigation */}
      <div className="navbar-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/jobs">
          Jobs
        </Link>

        {session ? (
          <>
            <Link
              to="/dashboard"
              className="dashboard-btn"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="logout-nav-btn"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/signup"
              className="signup-btn"
            >
              Sign Up
            </Link>

            <Link
              to="/login"
              className="login-btn"
            >
              Log In
            </Link>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;