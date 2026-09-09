import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "./dashboard.css";

const Dashboard = () => {
    const [repositories, setRepositories] = useState([]);
    const [suggestedRepositories, setSuggestedRepositories] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [visibilityFilter, setVisibilityFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    // Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newRepoName, setNewRepoName] = useState("");
    const [newRepoDesc, setNewRepoDesc] = useState("");
    const [newRepoVisibility, setNewRepoVisibility] = useState(true); // true = public
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState("");

    // Copy notification state
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [copiedCli, setCopiedCli] = useState(null);

    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    const fetchUserRepositories = async () => {
        if (!userId) return;
        try {
            const response = await fetch(`http://localhost:3000/repo/user/${userId}`);
            if (response.ok) {
                const data = await response.json();
                const list = Array.isArray(data.repositories)
                    ? data.repositories
                    : Array.isArray(data)
                    ? data
                    : [];
                setRepositories(list);
            } else {
                setRepositories([]);
            }
        } catch (err) {
            console.error("Error while fetching repositories:", err);
            setRepositories([]);
        }
    };

    const fetchSuggestedRepositories = async () => {
        try {
            const response = await fetch("http://localhost:3000/repo/all");
            if (response.ok) {
                const data = await response.json();
                setSuggestedRepositories(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("Error while fetching suggested repos:", err);
        }
    };

    const fetchUserProfile = async () => {
        if (!userId) return;
        try {
            const response = await fetch(`http://localhost:3000/userProfile/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setUserData(data);
            }
        } catch (err) {
            console.error("Error fetching user profile:", err);
        }
    };

    useEffect(() => {
        if (!userId) {
            navigate("/auth");
            return;
        }

        setLoading(true);
        Promise.all([
            fetchUserRepositories(),
            fetchSuggestedRepositories(),
            fetchUserProfile(),
        ]).finally(() => setLoading(false));
    }, [userId]);

    // Search and filter logic
    useEffect(() => {
        let list = [...repositories];

        if (visibilityFilter === "public") {
            list = list.filter((r) => r.visibility === true || r.visibility === "public");
        } else if (visibilityFilter === "private") {
            list = list.filter((r) => r.visibility === false || r.visibility === "private");
        }

        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            list = list.filter(
                (repo) =>
                    repo.name?.toLowerCase().includes(query) ||
                    repo.description?.toLowerCase().includes(query)
            );
        }

        setSearchResults(list);
    }, [searchQuery, visibilityFilter, repositories]);

    const handleCreateRepository = async (e) => {
        e.preventDefault();
        setCreateError("");

        const trimmedName = newRepoName.trim().replace(/\s+/g, "-");
        if (!trimmedName) {
            setCreateError("Repository name is required.");
            return;
        }

        try {
            setCreateLoading(true);
            const res = await fetch("http://localhost:3000/repo/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    owner: userId,
                    name: trimmedName,
                    description: newRepoDesc.trim(),
                    visibility: newRepoVisibility,
                    content: [],
                    issues: [],
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setCreateError(data.error || "Failed to create repository.");
            } else {
                // Success: reset form, close modal, and refresh repos
                setNewRepoName("");
                setNewRepoDesc("");
                setNewRepoVisibility(true);
                setIsCreateModalOpen(false);
                await fetchUserRepositories();
            }
        } catch (err) {
            console.error(err);
            setCreateError("Network error. Please try again.");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleCopyClone = (repoName, index) => {
        const cloneUrl = `nexcode clone http://localhost:3000/repo/${repoName}`;
        navigator.clipboard.writeText(cloneUrl);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleCopyCli = (cmd, key) => {
        navigator.clipboard.writeText(cmd);
        setCopiedCli(key);
        setTimeout(() => setCopiedCli(null), 2000);
    };

    // Calculate metrics
    const publicCount = repositories.filter(
        (r) => r.visibility === true || r.visibility === "public"
    ).length;
    const privateCount = repositories.length - publicCount;

    const cliCommands = [
        { label: "Init Repo", cmd: "nexcode init", id: "init" },
        { label: "Stage Files", cmd: "nexcode add <file>", id: "add" },
        { label: "Commit", cmd: 'nexcode commit "Initial commit"', id: "commit" },
        { label: "Push", cmd: "nexcode push", id: "push" },
    ];

    return (
        <div className="dashboard-page">
            <Navbar onOpenCreateModal={() => setIsCreateModalOpen(true)} />

            <div className="dashboard-container">
                {/* Hero / Greeting */}
                <div className="dashboard-hero">
                    <div className="dashboard-welcome">
                        <h2>Welcome back, {userData?.username || "Developer"}</h2>
                        <p>
                            Manage your cloud repositories, track team activity, and collaborate.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="nex-nav-create-btn"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        New Repository
                    </button>
                </div>

                {/* Metrics Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon-wrap indigo">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                                <path d="M6 6h10" />
                                <path d="M6 10h10" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{repositories.length}</span>
                            <span className="stat-label">Total Repositories</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon-wrap emerald">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{publicCount}</span>
                            <span className="stat-label">Public Repos</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon-wrap amber">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{privateCount}</span>
                            <span className="stat-label">Private Repos</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon-wrap cyan">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{suggestedRepositories.length}</span>
                            <span className="stat-label">Community Repos</span>
                        </div>
                    </div>
                </div>

                {/* 3-Column Layout */}
                <div className="dashboard-grid">
                    {/* Left Sidebar: Profile & Quick Filters */}
                    <aside className="dash-sidebar-left">
                        <div className="sidebar-card">
                            <div className="user-mini-profile">
                                <div className="user-avatar-large">
                                    {userData?.username ? userData.username.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div className="user-info-text">
                                    <h3>{userData?.username || "Developer"}</h3>
                                    <span>{userData?.email || "nexcode member"}</span>
                                </div>
                            </div>

                            <div className="sidebar-filter-list">
                                <button
                                    type="button"
                                    className={`filter-btn ${visibilityFilter === "all" ? "active" : ""}`}
                                    onClick={() => setVisibilityFilter("all")}
                                >
                                    <span>All Repositories</span>
                                    <span className="filter-badge">{repositories.length}</span>
                                </button>
                                <button
                                    type="button"
                                    className={`filter-btn ${visibilityFilter === "public" ? "active" : ""}`}
                                    onClick={() => setVisibilityFilter("public")}
                                >
                                    <span>Public</span>
                                    <span className="filter-badge">{publicCount}</span>
                                </button>
                                <button
                                    type="button"
                                    className={`filter-btn ${visibilityFilter === "private" ? "active" : ""}`}
                                    onClick={() => setVisibilityFilter("private")}
                                >
                                    <span>Private</span>
                                    <span className="filter-badge">{privateCount}</span>
                                </button>
                            </div>

                            <button
                                type="button"
                                className="sidebar-action-btn"
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                Create Repository
                            </button>
                        </div>

                        {/* Quick Navigation Card */}
                        <div className="sidebar-card">
                            <h4 className="card-heading">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                                </svg>
                                Quick Links
                            </h4>
                            <div className="sidebar-filter-list">
                                <Link to="/profile" className="filter-btn">
                                    <span>Your Profile</span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="m9 18 6-6-6-6" />
                                    </svg>
                                </Link>
                                <a
                                    href="https://github.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="filter-btn"
                                >
                                    <span>Documentation</span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                        <polyline points="15 3 21 3 21 9" />
                                        <line x1="10" y1="14" x2="21" y2="3" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </aside>

                    {/* Center Column: Repositories Feed */}
                    <main className="dash-feed">
                        {/* Search Toolbar */}
                        <div className="feed-toolbar">
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
                                    placeholder="Find a repository by name or description..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        className="feed-search-clear"
                                        onClick={() => setSearchQuery("")}
                                        aria-label="Clear search"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Repository Cards List */}
                        <div className="repos-list">
                            {searchResults.length > 0 ? (
                                searchResults.map((repo, idx) => {
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
                                                    <span className="repo-title">{repo.name}</span>
                                                    <span className={`repo-badge-pill ${isPublic ? "public" : "private"}`}>
                                                        {isPublic ? "Public" : "Private"}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="repo-desc">
                                                {repo.description || "No description provided for this repository."}
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
                                                    title="Copy clone command"
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                                    </svg>
                                                    {copiedIndex === idx ? "Copied!" : "Clone"}
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })
                            ) : (
                                <div className="empty-repos-card">
                                    <div className="empty-icon-wrap">
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                        </svg>
                                    </div>
                                    <h3>
                                        {searchQuery
                                            ? `No repositories match "${searchQuery}"`
                                            : "No repositories yet"}
                                    </h3>
                                    <p>
                                        {searchQuery
                                            ? "Try adjusting your search terms or filters to find what you're looking for."
                                            : "Create your first repository to start versioning code, collaborating, and tracking commits."}
                                    </p>
                                    <button
                                        type="button"
                                        className="nex-nav-create-btn"
                                        onClick={() => setIsCreateModalOpen(true)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <line x1="12" y1="5" x2="12" y2="19" />
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                        Create Repository
                                    </button>
                                </div>
                            )}
                        </div>
                    </main>

                    {/* Right Sidebar: Suggested Repos & CLI Cheat Sheet */}
                    <aside className="dash-sidebar-right">
                        {/* Suggested / Community Repos */}
                        <div className="sidebar-card">
                            <h4 className="card-heading">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                                Community Repos
                            </h4>

                            <div className="suggested-list">
                                {suggestedRepositories.length > 0 ? (
                                    suggestedRepositories.slice(0, 5).map((repo, idx) => (
                                        <div key={repo._id || idx} className="suggested-item">
                                            <div className="suggested-title">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
                                                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                                                </svg>
                                                <span>{repo.name}</span>
                                            </div>
                                            <p className="suggested-desc">
                                                {repo.description || "Open-source developer repository on NexCode"}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ fontSize: "0.84rem", color: "#64748b", margin: 0 }}>
                                        No community repos discovered yet.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* CLI Cheat Sheet */}
                        <div className="sidebar-card">
                            <h4 className="card-heading">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="4 17 10 11 4 5" />
                                    <line x1="12" y1="19" x2="20" y2="19" />
                                </svg>
                                NexCode CLI Guide
                            </h4>

                            <div className="cli-list">
                                {cliCommands.map((item) => (
                                    <div key={item.id} className="cli-item">
                                        <code className="cli-code">{item.cmd}</code>
                                        <button
                                            type="button"
                                            className="cli-copy-btn"
                                            onClick={() => handleCopyCli(item.cmd, item.id)}
                                            title="Copy command"
                                        >
                                            {copiedCli === item.id ? (
                                                <span style={{ fontSize: "0.72rem", color: "#34d399" }}>Copied!</span>
                                            ) : (
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Create Repository Modal */}
            {isCreateModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
                    <div className="create-repo-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create a New Repository</h3>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setIsCreateModalOpen(false)}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {createError && (
                            <div className="modal-error">
                                <span>{createError}</span>
                            </div>
                        )}

                        <form className="modal-form" onSubmit={handleCreateRepository}>
                            <div className="modal-field">
                                <label className="modal-label" htmlFor="repo-name-input">
                                    Repository Name *
                                </label>
                                <input
                                    id="repo-name-input"
                                    type="text"
                                    className="modal-input"
                                    placeholder="e.g. awesome-api, ml-pipeline"
                                    value={newRepoName}
                                    onChange={(e) => setNewRepoName(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="modal-field">
                                <label className="modal-label" htmlFor="repo-desc-input">
                                    Description (optional)
                                </label>
                                <textarea
                                    id="repo-desc-input"
                                    className="modal-textarea"
                                    placeholder="Brief summary of your repository..."
                                    value={newRepoDesc}
                                    onChange={(e) => setNewRepoDesc(e.target.value)}
                                />
                            </div>

                            <div className="modal-field">
                                <label className="modal-label">Visibility</label>
                                <div className="visibility-options">
                                    <label className={`visibility-radio-label ${newRepoVisibility ? "selected" : ""}`}>
                                        <input
                                            type="radio"
                                            name="visibility"
                                            checked={newRepoVisibility === true}
                                            onChange={() => setNewRepoVisibility(true)}
                                        />
                                        <div>
                                            <strong style={{ display: "block", fontSize: "0.88rem" }}>Public</strong>
                                            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                                                Anyone on NexCode can view
                                            </span>
                                        </div>
                                    </label>

                                    <label className={`visibility-radio-label ${!newRepoVisibility ? "selected" : ""}`}>
                                        <input
                                            type="radio"
                                            name="visibility"
                                            checked={newRepoVisibility === false}
                                            onChange={() => setNewRepoVisibility(false)}
                                        />
                                        <div>
                                            <strong style={{ display: "block", fontSize: "0.88rem" }}>Private</strong>
                                            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                                                Only you can view and commit
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="modal-cancel-btn"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="modal-submit-btn"
                                    disabled={createLoading}
                                >
                                    {createLoading ? "Creating..." : "Create Repository"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
