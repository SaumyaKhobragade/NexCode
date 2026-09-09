import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logo.png";
import "./navbar.css";

const Navbar = ({ onOpenCreateModal }) => {
    const { currentUser, setCurrentUser } = useAuth();
    const [username, setUsername] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (userId) {
            fetch(`http://localhost:3000/userProfile/${userId}`)
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => {
                    if (data && data.username) {
                        setUsername(data.username);
                    }
                })
                .catch(() => {
                    // Fail silently, fallback to generic
                });
        }
    }, [currentUser]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setCurrentUser(null);
        navigate("/auth");
    };

    return (
        <header className="nex-navbar">
            <div className="nex-nav-left">
                <Link to="/" className="nex-nav-brand">
                    <div className="nex-nav-logo-wrap">
                        <img src={logo} alt="NexCode Logo" className="nex-nav-logo" />
                    </div>
                    <h1 className="nex-nav-title">NexCode</h1>
                </Link>

                <nav className="nex-nav-links">
                    <Link
                        to="/"
                        className={`nex-nav-link ${location.pathname === "/" ? "active" : ""}`}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect width="7" height="9" x="3" y="3" rx="1" />
                            <rect width="7" height="5" x="14" y="3" rx="1" />
                            <rect width="7" height="9" x="14" y="12" rx="1" />
                            <rect width="7" height="5" x="3" y="16" rx="1" />
                        </svg>
                        Dashboard
                    </Link>
                    <Link
                        to="/issues"
                        className={`nex-nav-link ${location.pathname.startsWith("/issue") ? "active" : ""}`}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="1" />
                            <line x1="12" y1="7" x2="12" y2="13" />
                        </svg>
                        Issues
                    </Link>
                    <Link
                        to="/profile"
                        className={`nex-nav-link ${location.pathname === "/profile" ? "active" : ""}`}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        Profile
                    </Link>
                </nav>
            </div>

            <div className="nex-nav-right">
                {onOpenCreateModal ? (
                    <button
                        type="button"
                        className="nex-nav-create-btn"
                        onClick={onOpenCreateModal}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        New Repo
                    </button>
                ) : (
                    <Link to="/" className="nex-nav-create-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        New Repo
                    </Link>
                )}

                <div className="nex-nav-user-menu">
                    <Link to="/profile" className="nex-nav-avatar-btn" title="View Profile">
                        <div className="nex-nav-avatar-circle">
                            {username ? username.charAt(0).toUpperCase() : "U"}
                        </div>
                        <span>{username || "Developer"}</span>
                    </Link>

                    <button
                        type="button"
                        className="nex-nav-logout-btn"
                        onClick={handleLogout}
                        title="Sign Out"
                        aria-label="Sign Out"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
