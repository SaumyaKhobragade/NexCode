import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo.png";
import "./auth.css";

const Signup = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const { setCurrentUser } = useAuth();
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (!username.trim() || !email.trim() || !password.trim()) {
            setErrorMessage("Please fill in all fields.");
            return;
        }

        if (username.trim().length < 3) {
            setErrorMessage("Username must be at least 3 characters.");
            return;
        }

        if (password.length < 6) {
            setErrorMessage("Password must be at least 6 characters.");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post("http://localhost:3000/signup", {
                username: username.trim(),
                email: email.trim(),
                password: password,
            });

            if (res.data && res.data.token && res.data.userId) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("userId", res.data.userId);
                setCurrentUser(res.data.userId);
                navigate("/");
            } else {
                setErrorMessage("Unexpected response from server. Please try again.");
            }
        } catch (err) {
            console.error(err);
            const serverMsg =
                err.response?.data?.message ||
                err.response?.data ||
                "Failed to create account. Please check your details.";
            setErrorMessage(typeof serverMsg === "string" ? serverMsg : "Signup failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-glow-accent" />

            {/* Header / Brand */}
            <div className="auth-header">
                <Link to="/" className="auth-brand-badge">
                    <div className="auth-logo-wrapper">
                        <img className="auth-logo" src={logo} alt="NexCode Logo" />
                    </div>
                    <span className="auth-brand-name">NexCode</span>
                </Link>
                <h1 className="auth-title">Create your account</h1>
                <p className="auth-subtitle">
                    Join developers collaborating, hosting, and deploying on NexCode
                </p>
            </div>

            {/* Auth Card */}
            <div className="auth-card">
                {errorMessage && (
                    <div className="auth-error-banner" role="alert">
                        <svg
                            className="auth-error-icon"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{errorMessage}</span>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSignup}>
                    <div className="auth-field">
                        <label className="auth-label" htmlFor="signup-username">
                            Username
                        </label>
                        <div className="auth-input-wrapper">
                            <span className="auth-input-icon">
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </span>
                            <input
                                id="signup-username"
                                name="username"
                                type="text"
                                className="auth-input"
                                placeholder="octocat_dev"
                                autoComplete="username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label className="auth-label" htmlFor="signup-email">
                            Email address
                        </label>
                        <div className="auth-input-wrapper">
                            <span className="auth-input-icon">
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect width="20" height="16" x="2" y="4" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                            </span>
                            <input
                                id="signup-email"
                                name="email"
                                type="email"
                                className="auth-input"
                                placeholder="developer@nexcode.dev"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label className="auth-label" htmlFor="signup-password">
                            Password
                        </label>
                        <div className="auth-input-wrapper">
                            <span className="auth-input-icon">
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </span>
                            <input
                                id="signup-password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                className="auth-input"
                                placeholder="Min. 6 characters"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="auth-toggle-pwd"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                                        <line x1="2" x2="22" y1="2" y2="22" />
                                    </svg>
                                ) : (
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="auth-spinner" />
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            <span>Sign Up for NexCode</span>
                        )}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>Already a member?</span>
                </div>

                <div className="auth-card-footer">
                    <span>Already have an account?</span>
                    <Link to="/auth" className="auth-link">
                        Sign in
                    </Link>
                </div>
            </div>

            {/* Trust Footer */}
            <div className="auth-trust-badge">
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Encrypted & secure developer session</span>
            </div>
        </div>
    );
};

export default Signup;
