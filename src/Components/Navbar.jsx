import { Link } from "react-router-dom";

function Navbar() {
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

        <Link to="/signup" className="signup-btn">
          Sign Up
        </Link>

        <Link to="/login" className="login-btn">
          Log In
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;