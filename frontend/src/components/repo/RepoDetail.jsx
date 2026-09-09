import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import "./repo.css";

const DEFAULT_FILES = [
    {
        name: "README.md",
        type: "markdown",
        commitMsg: "Initial commit with documentation",
        updatedAt: "2 hours ago",
        content: `# Quantum Engine\n\nHigh-performance distributed execution engine built for NexCode cloud environments.\n\n## Getting Started\n\`\`\`bash\nnpx nexcode init\nnexcode pull\nnpm install\n\`\`\`\n\n## License\nMIT`
    },
    {
        name: "index.js",
        type: "javascript",
        commitMsg: "Add core pipeline orchestration hooks",
        updatedAt: "1 day ago",
        content: `// Main Entrypoint for Quantum Engine\nimport { createServer } from "http";\nimport { Orchestrator } from "./src/core.js";\n\nconst engine = new Orchestrator({\n    maxWorkers: 8,\n    telemetry: true\n});\n\nconsole.log("Quantum Engine initialized.");`
    },
    {
        name: "package.json",
        type: "json",
        commitMsg: "Update dependency tree",
        updatedAt: "3 days ago",
        content: `{\n  "name": "quantum-engine",\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "start": "node index.js",\n    "test": "vitest"\n  }\n}`
    },
    {
        name: ".gitignore",
        type: "config",
        commitMsg: "Ignore node_modules and .env",
        updatedAt: "1 week ago",
        content: `node_modules/\n.env\n.env.local\ndist/\n.DS_Store`
    },
    {
        name: "nexcode.config.json",
        type: "json",
        commitMsg: "Configure NexCode build targets",
        updatedAt: "2 weeks ago",
        content: `{\n  "builder": "nexcode-v2",\n  "cluster": "edge-us-east-1",\n  "autoDeploy": true\n}`
    }
];

const RepoDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUserId = localStorage.getItem("userId");

    const [repository, setRepository] = useState(null);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Active Tab: "code" | "issues" | "settings"
    const [activeTab, setActiveTab] = useState("code");

    // Clone Modal & Tab
    const [isCloneOpen, setIsCloneOpen] = useState(false);
    const [cloneProtocol, setCloneProtocol] = useState("cli");
    const [copiedClone, setCopiedClone] = useState(false);

    // Star counter & interaction
    const [starred, setStarred] = useState(false);
    const [starCount, setStarCount] = useState(12);

    // File Viewer Modal
    const [selectedFile, setSelectedFile] = useState(null);
    const [copiedFile, setCopiedFile] = useState(false);

    // Issues filter & search
    const [issueFilter, setIssueFilter] = useState("all"); // all | open | closed
    const [issueSearch, setIssueSearch] = useState("");
    const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);
    const [newIssueTitle, setNewIssueTitle] = useState("");
    const [newIssueDesc, setNewIssueDesc] = useState("");
    const [issueSubmitting, setIssueSubmitting] = useState(false);

    // Settings form state
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [settingsMsg, setSettingsMsg] = useState(null);

    // Fetch repository & issues
    useEffect(() => {
        const fetchRepoData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [repoRes, issueRes] = await Promise.all([
                    axios.get(`http://localhost:3000/repo/${id}`),
                    axios.get(`http://localhost:3000/issues/repo/${id}`).catch(() => ({ data: [] }))
                ]);

                // Backend findById returns object
                const repoData = Array.isArray(repoRes.data) ? repoRes.data[0] : repoRes.data;
                if (!repoData) {
                    setError("Repository not found.");
                    setLoading(false);
                    return;
                }

                setRepository(repoData);
                setEditName(repoData.name || "");
                setEditDesc(repoData.description || "");

                const issueList = Array.isArray(issueRes.data)
                    ? issueRes.data
                    : repoData.issues || [];
                setIssues(issueList);
            } catch (err) {
                console.error("Error fetching repository:", err);
                setError(err.response?.data?.error || "Failed to load repository.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRepoData();
        }
    }, [id]);

    const isOwner =
        repository?.owner?._id === currentUserId ||
        repository?.owner === currentUserId;

    const ownerName =
        repository?.owner?.username || "developer";

    // Handle Star click
    const handleToggleStar = () => {
        if (starred) {
            setStarCount((prev) => prev - 1);
            setStarred(false);
        } else {
            setStarCount((prev) => prev + 1);
            setStarred(true);
        }
    };

    // Clone command copy
    const getCloneString = () => {
        if (cloneProtocol === "cli") {
            return `nexcode clone http://localhost:3000/repo/${repository?.name}`;
        }
        if (cloneProtocol === "https") {
            return `https://nexcode.dev/${ownerName}/${repository?.name}.git`;
        }
        return `git@nexcode.dev:${ownerName}/${repository?.name}.git`;
    };

    const handleCopyClone = () => {
        navigator.clipboard.writeText(getCloneString());
        setCopiedClone(true);
        setTimeout(() => setCopiedClone(false), 2000);
    };

    // Copy file content
    const handleCopyFileContent = () => {
        if (selectedFile) {
            navigator.clipboard.writeText(selectedFile.content);
            setCopiedFile(true);
            setTimeout(() => setCopiedFile(false), 2000);
        }
    };

    // Create New Issue
    const handleCreateIssue = async (e) => {
        e.preventDefault();
        if (!newIssueTitle.trim() || !newIssueDesc.trim()) return;

        try {
            setIssueSubmitting(true);
            const res = await axios.post("http://localhost:3000/issues/create", {
                title: newIssueTitle,
                description: newIssueDesc,
                repository: id
            });

            setIssues([res.data, ...issues]);
            setNewIssueTitle("");
            setNewIssueDesc("");
            setIsNewIssueOpen(false);
        } catch (err) {
            console.error("Error creating issue:", err);
            alert("Failed to create issue. Please check server connection.");
        } finally {
            setIssueSubmitting(false);
        }
    };

    // Toggle Issue Status
    const handleToggleIssueStatus = async (issueItem) => {
        const nextStatus = issueItem.status === "open" ? "closed" : "open";
        try {
            const res = await axios.put(`http://localhost:3000/issues/update/${issueItem._id}`, {
                status: nextStatus
            });

            setIssues((prev) =>
                prev.map((it) => (it._id === issueItem._id ? res.data : it))
            );
        } catch (err) {
            console.error("Error updating issue status:", err);
        }
    };

    // Delete Issue
    const handleDeleteIssue = async (issueId) => {
        if (!window.confirm("Are you sure you want to delete this issue?")) return;
        try {
            await axios.delete(`http://localhost:3000/issues/delete/${issueId}`);
            setIssues((prev) => prev.filter((it) => it._id !== issueId));
        } catch (err) {
            console.error("Error deleting issue:", err);
        }
    };

    // Save Settings
    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            setSettingsSaving(true);
            setSettingsMsg(null);
            const res = await axios.put(`http://localhost:3000/repo/update/${id}`, {
                name: editName,
                description: editDesc
            });

            setRepository(res.data.repository);
            setSettingsMsg({ type: "success", text: "Repository settings updated successfully!" });
        } catch (err) {
            console.error("Error updating repository settings:", err);
            setSettingsMsg({ type: "error", text: "Failed to update repository settings." });
        } finally {
            setSettingsSaving(false);
        }
    };

    // Toggle Visibility
    const handleToggleVisibility = async () => {
        try {
            const res = await axios.patch(`http://localhost:3000/repo/toggle/${id}`);
            setRepository(res.data.repository);
        } catch (err) {
            console.error("Error toggling visibility:", err);
        }
    };

    // Delete Repository
    const handleDeleteRepository = async () => {
        const confirmName = window.prompt(`Type "${repository?.name}" to permanently delete this repository:`);
        if (confirmName !== repository?.name) {
            alert("Repository name did not match. Deletion cancelled.");
            return;
        }

        try {
            await axios.delete(`http://localhost:3000/repo/delete/${id}`);
            alert("Repository deleted successfully.");
            navigate("/");
        } catch (err) {
            console.error("Error deleting repository:", err);
            alert("Failed to delete repository.");
        }
    };

    // Filtered issues
    const filteredIssues = issues.filter((it) => {
        const matchesFilter =
            issueFilter === "all" ? true : it.status === issueFilter;
        const matchesSearch =
            it.title?.toLowerCase().includes(issueSearch.toLowerCase()) ||
            it.description?.toLowerCase().includes(issueSearch.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const openIssuesCount = issues.filter((it) => it.status === "open").length;
    const closedIssuesCount = issues.filter((it) => it.status === "closed").length;

    if (loading) {
        return (
            <div className="repo-page-root">
                <Navbar />
                <div className="repo-loading-state">
                    <div className="repo-spinner" />
                    <p>Loading repository metadata...</p>
                </div>
            </div>
        );
    }

    if (error || !repository) {
        return (
            <div className="repo-page-root">
                <Navbar />
                <div className="repo-error-state">
                    <h3>Repository Error</h3>
                    <p>{error || "Repository does not exist."}</p>
                    <Link to="/" className="repo-back-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const isPublic = repository.visibility === true || repository.visibility === "public";

    return (
        <div className="repo-page-root">
            <Navbar />

            <main className="repo-detail-container">
                {/* Repository Top Header */}
                <section className="repo-header-section">
                    <div className="repo-header-top">
                        <div className="repo-title-breadcrumb">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2">
                                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                                <path d="M6 6h10" />
                                <path d="M6 10h10" />
                            </svg>
                            <Link to="/profile" className="repo-owner-link">
                                {ownerName}
                            </Link>
                            <span className="repo-crumb-divider">/</span>
                            <span className="repo-name-text">{repository.name}</span>
                            <span className={`repo-vis-badge ${isPublic ? "public" : "private"}`}>
                                {isPublic ? "Public" : "Private"}
                            </span>
                        </div>

                        <div className="repo-header-actions">
                            <button
                                type="button"
                                className={`repo-action-btn ${starred ? "active" : ""}`}
                                onClick={handleToggleStar}
                                title={starred ? "Unstar repository" : "Star repository"}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill={starred ? "#fbbf24" : "none"} stroke="currentColor" strokeWidth="2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                                <span>{starred ? "Starred" : "Star"}</span>
                                <span className="repo-action-count">{starCount}</span>
                            </button>

                            <button
                                type="button"
                                className="repo-action-btn repo-clone-dropdown-btn"
                                onClick={() => setIsCloneOpen(true)}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                <span>Code / Clone</span>
                            </button>
                        </div>
                    </div>

                    <p className="repo-description-bar">
                        {repository.description || "No repository description provided yet."}
                    </p>

                    {/* Navigation Tabs */}
                    <nav className="repo-nav-tabs">
                        <button
                            type="button"
                            className={`repo-tab-item ${activeTab === "code" ? "active" : ""}`}
                            onClick={() => setActiveTab("code")}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="16 18 22 12 16 6" />
                                <polyline points="8 6 2 12 8 18" />
                            </svg>
                            <span>Code</span>
                        </button>

                        <button
                            type="button"
                            className={`repo-tab-item ${activeTab === "issues" ? "active" : ""}`}
                            onClick={() => setActiveTab("issues")}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="12" r="1" />
                                <line x1="12" y1="7" x2="12" y2="13" />
                            </svg>
                            <span>Issues</span>
                            <span className="repo-tab-badge">{openIssuesCount}</span>
                        </button>

                        {isOwner && (
                            <button
                                type="button"
                                className={`repo-tab-item ${activeTab === "settings" ? "active" : ""}`}
                                onClick={() => setActiveTab("settings")}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                </svg>
                                <span>Settings</span>
                            </button>
                        )}
                    </nav>
                </section>

                {/* TAB 1: CODE */}
                {activeTab === "code" && (
                    <div className="repo-code-grid">
                        <div className="repo-code-main">
                            {/* File Explorer */}
                            <div className="repo-explorer-card">
                                <div className="repo-explorer-header">
                                    <div className="explorer-branch-info">
                                        <span className="branch-badge">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="6" y1="3" x2="6" y2="15" />
                                                <circle cx="18" cy="6" r="3" />
                                                <circle cx="6" cy="18" r="3" />
                                                <path d="M18 9a9 9 0 0 1-9 9" />
                                            </svg>
                                            main
                                        </span>
                                        <span>Initial release branch</span>
                                    </div>
                                    <span className="explorer-commit-stats">5 files tracked</span>
                                </div>

                                <ul className="repo-file-list">
                                    {DEFAULT_FILES.map((file, idx) => (
                                        <li
                                            key={idx}
                                            className="repo-file-row"
                                            onClick={() => setSelectedFile(file)}
                                            title={`Click to view ${file.name}`}
                                        >
                                            <div className="file-icon-wrap">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                    <polyline points="14 2 14 8 20 8" />
                                                </svg>
                                            </div>
                                            <span className="file-name-txt">{file.name}</span>
                                            <span className="file-commit-msg">{file.commitMsg}</span>
                                            <span className="file-time-txt">{file.updatedAt}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Formatted README Card */}
                            <div className="repo-readme-card">
                                <div className="readme-card-header">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                                        <path d="M6 6h10" />
                                        <path d="M6 10h10" />
                                    </svg>
                                    <span>README.md</span>
                                </div>
                                <div className="readme-card-body">
                                    <h1 className="readme-title">{repository.name}</h1>
                                    <p className="readme-subtitle">
                                        {repository.description || "Next-generation distributed codebase hosted on NexCode."}
                                    </p>

                                    <h3 className="readme-section-heading">Quick Start with NexCode CLI</h3>
                                    <div className="readme-code-block">
                                        {`# Clone this repository\nnexcode clone http://localhost:3000/repo/${repository.name}\n\n# Navigate to project\ncd ${repository.name}\n\n# Pull latest remote sync\nnexcode pull`}
                                    </div>

                                    <h3 className="readme-section-heading">Deployment & Sync</h3>
                                    <p style={{ color: "#94a3b8", fontSize: "0.88rem" }}>
                                        Push local changes anytime with <code>nexcode commit -m "update"</code> followed by <code>nexcode push</code> to sync with your cloud cluster.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Code Tab Sidebar */}
                        <aside className="repo-code-sidebar">
                            <div className="sidebar-info-card">
                                <h4 className="sidebar-card-title">About</h4>
                                <p className="sidebar-desc-txt">
                                    {repository.description || "No description provided."}
                                </p>
                                <div className="sidebar-meta-list">
                                    <div className="sidebar-meta-row">
                                        <span>Visibility</span>
                                        <span className="sidebar-meta-val">{isPublic ? "Public" : "Private"}</span>
                                    </div>
                                    <div className="sidebar-meta-row">
                                        <span>Stars</span>
                                        <span className="sidebar-meta-val">{starCount}</span>
                                    </div>
                                    <div className="sidebar-meta-row">
                                        <span>Issues</span>
                                        <span className="sidebar-meta-val">{issues.length}</span>
                                    </div>
                                    <div className="sidebar-meta-row">
                                        <span>Default Branch</span>
                                        <span className="sidebar-meta-val">main</span>
                                    </div>
                                </div>
                            </div>

                            <div className="sidebar-info-card">
                                <h4 className="sidebar-card-title">Languages</h4>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
                                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }} />
                                    <span>JavaScript 100.0%</span>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}

                {/* TAB 2: ISSUES */}
                {activeTab === "issues" && (
                    <div className="issues-container">
                        <div className="issues-toolbar">
                            <div className="issues-filter-group">
                                <button
                                    type="button"
                                    className={`issue-filter-pill ${issueFilter === "all" ? "active" : ""}`}
                                    onClick={() => setIssueFilter("all")}
                                >
                                    <span>All</span>
                                    <span className="issue-pill-count">{issues.length}</span>
                                </button>
                                <button
                                    type="button"
                                    className={`issue-filter-pill ${issueFilter === "open" ? "active" : ""}`}
                                    onClick={() => setIssueFilter("open")}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                                        <circle cx="12" cy="12" r="10" />
                                    </svg>
                                    <span>Open</span>
                                    <span className="issue-pill-count">{openIssuesCount}</span>
                                </button>
                                <button
                                    type="button"
                                    className={`issue-filter-pill ${issueFilter === "closed" ? "active" : ""}`}
                                    onClick={() => setIssueFilter("closed")}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    <span>Closed</span>
                                    <span className="issue-pill-count">{closedIssuesCount}</span>
                                </button>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <div className="issues-search-box">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Filter issues..."
                                        value={issueSearch}
                                        onChange={(e) => setIssueSearch(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="new-issue-btn"
                                    onClick={() => setIsNewIssueOpen(true)}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    <span>New Issue</span>
                                </button>
                            </div>
                        </div>

                        {/* Issues List */}
                        <div className="issues-card-list">
                            {filteredIssues.length > 0 ? (
                                filteredIssues.map((it) => (
                                    <div key={it._id} className="issue-item-row">
                                        <div className="issue-main-info">
                                            <div className={`issue-status-badge ${it.status}`}>
                                                {it.status === "open" ? (
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <circle cx="12" cy="12" r="2" fill="currentColor" />
                                                    </svg>
                                                ) : (
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                        <polyline points="22 4 12 14.01 9 11.01" />
                                                    </svg>
                                                )}
                                            </div>

                                            <div className="issue-title-group">
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                                    <Link
                                                        to={`/issues/${it._id}`}
                                                        className="issue-title-text"
                                                        style={{ textDecoration: "none", color: "inherit" }}
                                                    >
                                                        {it.title}
                                                    </Link>
                                                    {(it.labels || []).map((lbl, idx) => (
                                                        <span key={idx} className={`issue-label-pill ${lbl}`}>
                                                            {lbl}
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="issue-desc-text">{it.description}</p>
                                                <span className="issue-meta-text">
                                                    #{it._id.slice(-5)} opened by <strong>{it.author || "developer"}</strong> • {(it.comments || []).length} comments
                                                </span>
                                            </div>
                                        </div>

                                        <div className="issue-action-buttons">
                                            <button
                                                type="button"
                                                className="issue-toggle-btn"
                                                onClick={() => handleToggleIssueStatus(it)}
                                                title={it.status === "open" ? "Close issue" : "Reopen issue"}
                                            >
                                                {it.status === "open" ? "Close Issue" : "Reopen"}
                                            </button>
                                            <button
                                                type="button"
                                                className="issue-delete-btn"
                                                onClick={() => handleDeleteIssue(it._id)}
                                                title="Delete issue"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="issues-empty-state">
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    <p>No issues match your criteria.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 3: SETTINGS */}
                {activeTab === "settings" && isOwner && (
                    <div className="repo-settings-container">
                        {settingsMsg && (
                            <div
                                style={{
                                    padding: "0.85rem 1.25rem",
                                    borderRadius: "8px",
                                    fontSize: "0.9rem",
                                    background: settingsMsg.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                    border: `1px solid ${settingsMsg.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                                    color: settingsMsg.type === "success" ? "#34d399" : "#f87171"
                                }}
                            >
                                {settingsMsg.text}
                            </div>
                        )}

                        {/* General Settings */}
                        <div className="settings-card">
                            <h3 className="settings-card-title">General Settings</h3>
                            <p className="settings-card-desc">Update your repository identifier and public overview description.</p>
                            <form onSubmit={handleSaveSettings}>
                                <div className="issue-form-group">
                                    <label>Repository Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="issue-form-group">
                                    <label>Description</label>
                                    <textarea
                                        rows={3}
                                        value={editDesc}
                                        onChange={(e) => setEditDesc(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="settings-save-btn"
                                    disabled={settingsSaving}
                                >
                                    {settingsSaving ? "Saving..." : "Save Changes"}
                                </button>
                            </form>
                        </div>

                        {/* Visibility Setting */}
                        <div className="settings-card">
                            <div className="visibility-switch-row">
                                <div>
                                    <h3 className="settings-card-title">Repository Visibility</h3>
                                    <p className="settings-card-desc">
                                        This repository is currently <strong>{isPublic ? "Public" : "Private"}</strong>.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="visibility-toggle-btn"
                                    onClick={handleToggleVisibility}
                                >
                                    Switch to {isPublic ? "Private" : "Public"}
                                </button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="settings-card danger">
                            <h3 className="settings-card-title" style={{ color: "#ef4444" }}>Danger Zone</h3>
                            <p className="settings-card-desc">
                                Deleting this repository will remove all associated commits, branches, and issues permanently.
                            </p>
                            <button
                                type="button"
                                className="danger-delete-btn"
                                onClick={handleDeleteRepository}
                            >
                                Delete this repository
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Clone Modal Overlay */}
            {isCloneOpen && (
                <div className="clone-popover-overlay" onClick={() => setIsCloneOpen(false)}>
                    <div className="clone-popover-box" onClick={(e) => e.stopPropagation()}>
                        <div className="clone-popover-header">
                            <h3>Clone Repository</h3>
                            <button
                                type="button"
                                className="clone-close-btn"
                                onClick={() => setIsCloneOpen(false)}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="clone-tab-select">
                            <button
                                type="button"
                                className={`clone-tab-btn ${cloneProtocol === "cli" ? "active" : ""}`}
                                onClick={() => setCloneProtocol("cli")}
                            >
                                NexCode CLI
                            </button>
                            <button
                                type="button"
                                className={`clone-tab-btn ${cloneProtocol === "https" ? "active" : ""}`}
                                onClick={() => setCloneProtocol("https")}
                            >
                                HTTPS
                            </button>
                            <button
                                type="button"
                                className={`clone-tab-btn ${cloneProtocol === "ssh" ? "active" : ""}`}
                                onClick={() => setCloneProtocol("ssh")}
                            >
                                SSH
                            </button>
                        </div>

                        <div className="clone-input-wrap">
                            <input
                                type="text"
                                readOnly
                                value={getCloneString()}
                            />
                            <button
                                type="button"
                                className="clone-copy-btn"
                                onClick={handleCopyClone}
                            >
                                {copiedClone ? "Copied!" : "Copy"}
                            </button>
                        </div>

                        <p className="clone-instructions">
                            Use the NexCode command line interface or standard Git client to synchronize this repository to your local workstation.
                        </p>
                    </div>
                </div>
            )}

            {/* File Viewer Modal */}
            {selectedFile && (
                <div className="clone-popover-overlay" onClick={() => setSelectedFile(null)}>
                    <div className="file-viewer-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="file-viewer-header">
                            <div className="file-viewer-title-group">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                                <span>{selectedFile.name}</span>
                            </div>
                            <div className="file-viewer-actions">
                                <button
                                    type="button"
                                    className="file-copy-btn"
                                    onClick={handleCopyFileContent}
                                >
                                    {copiedFile ? "Copied!" : "Copy Raw"}
                                </button>
                                <button
                                    type="button"
                                    className="clone-close-btn"
                                    onClick={() => setSelectedFile(null)}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <pre className="file-viewer-content">
                            <code>{selectedFile.content}</code>
                        </pre>
                    </div>
                </div>
            )}

            {/* New Issue Modal */}
            {isNewIssueOpen && (
                <div className="clone-popover-overlay" onClick={() => setIsNewIssueOpen(false)}>
                    <div className="issue-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="issue-modal-header">
                            <h3>Open a New Issue</h3>
                            <button
                                type="button"
                                className="clone-close-btn"
                                onClick={() => setIsNewIssueOpen(false)}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateIssue}>
                            <div className="issue-form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Add caching layer to compute engine"
                                    value={newIssueTitle}
                                    onChange={(e) => setNewIssueTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="issue-form-group">
                                <label>Description</label>
                                <textarea
                                    rows={4}
                                    placeholder="Describe the bug or feature request in detail..."
                                    value={newIssueDesc}
                                    onChange={(e) => setNewIssueDesc(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="issue-modal-footer">
                                <button
                                    type="button"
                                    className="modal-cancel-btn"
                                    onClick={() => setIsNewIssueOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="new-issue-btn"
                                    disabled={issueSubmitting}
                                >
                                    {issueSubmitting ? "Submitting..." : "Submit Issue"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RepoDetail;
