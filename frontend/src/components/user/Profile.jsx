import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../contexts/AuthContext";
import "./profile.css";

const Profile = () => {
    const navigate = useNavigate();
    const { setCurrentUser } = useAuth();
    const userId = localStorage.getItem("userId");

    const [userDetails, setUserDetails] = useState(null);
    const [repositories, setRepositories] = useState([]);
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);

    // Edit Profile form state
    const [editEmail, setEditEmail] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState("");
    const [saveError, setSaveError] = useState("");

    // Copy states
    const [copiedShare, setCopiedShare] = useState(false);
    const [copiedCloneIndex, setCopiedCloneIndex] = useState(null);

    // Search query in Repositories tab
    const [repoSearch, setRepoSearch] = useState("");

    useEffect(() => {
        if (!userId) {
            navigate("/auth");
            return;
        }

        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const [userRes, repoRes] = await Promise.all([
                    axios.get(`http://localhost:3000/userProfile/${userId}`),
                    axios.get(`http://localhost:3000/repo/user/${userId}`),
                ]);

                if (userRes.data) {
                    setUserDetails(userRes.data);
                    setEditEmail(userRes.data.email || "");
                }

                if (repoRes.data) {
                    const list = Array.isArray(repoRes.data.repositories)
                        ? repoRes.data.repositories
                        : Array.isArray(repoRes.data)
                        ? repoRes.data
                        : [];
                    setRepositories(list);
                }
            } catch (err) {
                console.error("Error fetching profile details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [userId]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setCurrentUser(null);
        navigate("/auth");
    };

    const handleShareProfile = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
    };

    const handleCopyClone = (repoName, index) => {
        navigator.clipboard.writeText(`nexcode clone http://localhost:3000/repo/${repoName}`);
        setCopiedCloneIndex(index);
        setTimeout(() => setCopiedCloneIndex(null), 2000);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaveSuccess("");
        setSaveError("");

        if (!editEmail.trim()) {
            setSaveError("Email cannot be empty.");
            return;
        }

        try {
            setSaveLoading(true);
            const payload = { email: editEmail.trim() };
            if (editPassword.trim()) {
                if (editPassword.length < 6) {
                    setSaveError("Password must be at least 6 characters.");
                    setSaveLoading(false);
                    return;
                }
                payload.password = editPassword;
            }

            const res = await axios.put(
                `http://localhost:3000/updateProfile/${userId}`,
                payload
            );

            if (res.data) {
                setUserDetails(res.data);
                setSaveSuccess("Profile updated successfully!");
                setEditPassword("");
            }
        } catch (err) {
            console.error(err);
            setSaveError(
                err.response?.data?.message || "Failed to update profile. Please try again."
            );
        } finally {
            setSaveLoading(false);
        }
    };

    const filteredRepos = repositories.filter((r) =>
        r.name?.toLowerCase().includes(repoSearch.toLowerCase()) ||
        r.description?.toLowerCase().includes(repoSearch.toLowerCase())
    );

    const username = userDetails?.username || "Developer";
    const email = userDetails?.email || "developer@nexcode.dev";

    return (
        <div className="profile-page">
            <Navbar />

            <div className="profile-container">
                <div className="profile-grid">
                    {/* Left Sidebar: User Card */}
                    <aside className="profile-sidebar">
                        <div className="profile-user-card">
                            <div className="profile-avatar-wrapper">
                                <div className="profile-avatar-large">
                                    {username.charAt(0).toUpperCase()}
                                </div>
                                <div className="profile-online-badge" title="Active on NexCode" />
                            </div>

                            <div className="profile-user-info">
                                <h2 className="profile-name">{username}</h2>
                                <div className="profile-handle">@{username.toLowerCase()}</div>
                                <div className="profile-email-badge">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect width="20" height="16" x="2" y="4" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                    <span>{email}</span>
                                </div>
                            </div>

                            <div className="profile-stats-row">
                                <div className="profile-stat-box">
                                    <span className="profile-stat-num">{repositories.length}</span>
                                    <span className="profile-stat-txt">Repositories</span>
                                </div>
                                <div className="profile-stat-box">
                                    <span className="profile-stat-num">
                                        {repositories.filter((r) => r.visibility === true || r.visibility === "public").length}
                                    </span>
                                    <span className="profile-stat-txt">Public</span>
                                </div>
                                <div className="profile-stat-box">
                                    <span className="profile-stat-num">0</span>
                                    <span className="profile-stat-txt">Followers</span>
                                </div>
                            </div>

                            <div className="profile-actions">
                                <button
                                    type="button"
                                    className="profile-btn-primary"
                                    onClick={() => setActiveTab("settings")}
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 20h9" />
                                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                    </svg>
                                    Edit Profile
                                </button>

                                <button
                                    type="button"
                                    className="profile-btn-secondary"
                                    onClick={handleShareProfile}
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="18" cy="5" r="3" />
                                        <circle cx="6" cy="12" r="3" />
                                        <circle cx="18" cy="19" r="3" />
                                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                                    </svg>
                                    {copiedShare ? "Link Copied!" : "Share Profile"}
                                </button>

                                <button
                                    type="button"
                                    className="profile-btn-danger"
                                    onClick={handleLogout}
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Right Main Content */}
                    <main className="profile-main">
                        {/* Tabs */}
                        <div className="profile-tabs">
                            <button
                                type="button"
                                className={`profile-tab-btn ${activeTab === "overview" ? "active" : ""}`}
                                onClick={() => setActiveTab("overview")}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect width="7" height="9" x="3" y="3" rx="1" />
                                    <rect width="7" height="5" x="14" y="3" rx="1" />
                                    <rect width="7" height="9" x="14" y="12" rx="1" />
                                    <rect width="7" height="5" x="3" y="16" rx="1" />
                                </svg>
                                <span>Overview</span>
                            </button>

                            <button
                                type="button"
                                className={`profile-tab-btn ${activeTab === "repositories" ? "active" : ""}`}
                                onClick={() => setActiveTab("repositories")}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                                    <path d="M6 6h10" />
                                    <path d="M6 10h10" />
                                </svg>
                                <span>Repositories</span>
                                <span className="tab-badge">{repositories.length}</span>
                            </button>

                            <button
                                type="button"
                                className={`profile-tab-btn ${activeTab === "settings" ? "active" : ""}`}
                                onClick={() => setActiveTab("settings")}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                </svg>
                                <span>Settings</span>
                            </button>
                        </div>

                        {/* Tab 1: Overview */}
                        {activeTab === "overview" && (
                            <>
                                <HeatMapProfile />

                                <div className="profile-section-card">
                                    <div className="section-header">
                                        <h4>Your Repositories</h4>
                                        <Link to="/" style={{ color: "#818cf8", fontSize: "0.84rem", textDecoration: "none" }}>
                                            View all on dashboard &rarr;
                                        </Link>
                                    </div>

                                    {repositories.length > 0 ? (
                                        <div className="profile-repo-grid">
                                            {repositories.slice(0, 4).map((repo, idx) => {
                                                const isPublic = repo.visibility === true || repo.visibility === "public";
                                                return (
                                                    <article key={repo._id || idx} className="repo-card">
                                                        <div className="repo-card-top">
                                                            <div className="repo-card-title-wrap">
                                                                <svg
                                                                    className="repo-icon-badge"
                                                                    width="18"
                                                                    height="18"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                >
                                                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                                                </svg>
                                                                <Link to={`/repo/${repo._id}`} className="repo-title" style={{ textDecoration: "none", color: "inherit" }}>
                                                                    {repo.name}
                                                                </Link>
                                                                <span className={`repo-badge-pill ${isPublic ? "public" : "private"}`}>
                                                                    {isPublic ? "Public" : "Private"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <p className="repo-desc">
                                                            {repo.description || "No description provided."}
                                                        </p>

                                                        <div className="repo-meta">
                                                            <div className="repo-lang-wrap">
                                                                <span className="repo-lang-dot" />
                                                                <span>JavaScript</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="repo-copy-btn"
                                                                onClick={() => handleCopyClone(repo.name, idx)}
                                                            >
                                                                {copiedCloneIndex === idx ? "Copied!" : "Clone"}
                                                            </button>
                                                        </div>
                                                    </article>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>
                                            No repositories created yet.{" "}
                                            <Link to="/" style={{ color: "#818cf8" }}>
                                                Create one on the dashboard!
                                            </Link>
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Tab 2: Repositories */}
                        {activeTab === "repositories" && (
                            <div className="profile-section-card">
                                <div className="section-header">
                                    <h4>All Repositories ({repositories.length})</h4>
                                </div>

                                <div className="feed-toolbar" style={{ marginBottom: "20px" }}>
                                    <div className="feed-search-wrap">
                                        <svg
                                            className="feed-search-icon"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <circle cx="11" cy="11" r="8" />
                                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
                                        <input
                                            type="text"
                                            className="feed-search-input"
                                            placeholder="Filter repositories by name..."
                                            value={repoSearch}
                                            onChange={(e) => setRepoSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {filteredRepos.length > 0 ? (
                                    <div className="repos-list">
                                        {filteredRepos.map((repo, idx) => {
                                            const isPublic = repo.visibility === true || repo.visibility === "public";
                                            return (
                                                <article key={repo._id || idx} className="repo-card">
                                                    <div className="repo-card-top">
                                                        <div className="repo-card-title-wrap">
                                                            <svg
                                                                className="repo-icon-badge"
                                                                width="18"
                                                                height="18"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                            >
                                                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                                            </svg>
                                                            <Link to={`/repo/${repo._id}`} className="repo-title" style={{ textDecoration: "none", color: "inherit" }}>
                                                                {repo.name}
                                                            </Link>
                                                            <span className={`repo-badge-pill ${isPublic ? "public" : "private"}`}>
                                                                {isPublic ? "Public" : "Private"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <p className="repo-desc">
                                                        {repo.description || "No description provided."}
                                                    </p>

                                                    <div className="repo-meta">
                                                        <div className="repo-lang-wrap">
                                                            <span className="repo-lang-dot" />
                                                            <span>JavaScript</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="repo-copy-btn"
                                                            onClick={() => handleCopyClone(repo.name, idx)}
                                                        >
                                                            {copiedCloneIndex === idx ? "Copied!" : "Clone"}
                                                        </button>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                                        No repositories matching your search.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Tab 3: Settings */}
                        {activeTab === "settings" && (
                            <div className="profile-section-card">
                                <div className="section-header">
                                    <h4>Account Settings</h4>
                                </div>

                                {saveSuccess && <div className="settings-success">{saveSuccess}</div>}
                                {saveError && <div className="settings-error">{saveError}</div>}

                                <form className="profile-settings-form" onSubmit={handleUpdateProfile}>
                                    <div className="settings-group">
                                        <label className="settings-label">Username</label>
                                        <input
                                            type="text"
                                            className="settings-input"
                                            value={username}
                                            disabled
                                        />
                                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                            Username is unique and permanent.
                                        </span>
                                    </div>

                                    <div className="settings-group">
                                        <label className="settings-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="settings-input"
                                            value={editEmail}
                                            onChange={(e) => setEditEmail(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="settings-group">
                                        <label className="settings-label">New Password (optional)</label>
                                        <input
                                            type="password"
                                            className="settings-input"
                                            placeholder="Leave blank to keep current password"
                                            value={editPassword}
                                            onChange={(e) => setEditPassword(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="profile-btn-primary"
                                        style={{ width: "160px", marginTop: "10px" }}
                                        disabled={saveLoading}
                                    >
                                        {saveLoading ? "Saving..." : "Save Changes"}
                                    </button>
                                </form>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Profile;
