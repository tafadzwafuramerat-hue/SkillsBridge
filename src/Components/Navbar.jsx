function Navbar() {
    return (
        <nav className="navbar">
        <div className="logo">SkillBridge</div>

        <div className="nav-links">
             <a href="/">Jobs</a>
             <a href="/">Companies</a>
             <a href="/">Resources</a>
        </div>

        <div className="nav-buttons">
            <button className="login-button">Login</button>
            <button className="signup-button">Sign Up</button>
        </div>
        </nav>
    );
}

export default Navbar;