import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import "./issue.css";

const GlobalIssues = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRepo, setSelectedRepo] = useState("all");

    const fetchAllIssues = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:3000/issues/all");
            setIssues(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching all issues:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllIssues();
    }, []);

    // Unique repos
    const repoOptions = Array.from(
        new Set(
            issues
                .map((i) => i.repository?.name)
                .filter(Boolean)
        )
    );

    const filteredIssues = issues.filter((it) => {
        const matchesStatus =
            filterStatus === "all" ? true : it.status === filterStatus;
        const matchesRepo =
            selectedRepo === "all" ? true : it.repository?.name === selectedRepo;
        const matchesSearch =
            it.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            it.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            it.repository?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesRepo && matchesSearch;
    });

    const openCount = issues.filter((it) => it.status === "open").length;
    const closedCount = issues.filter((it) => it.status === "closed").length;

    return (
        <div className="issue-page-root">
            <Navbar />

            <main className="issue-container">
                {/* Hero Header */}
                <div className="global-issues-hero">
                    <h2>Issues Tracker</h2>
                    <p>Track tasks, bugs, and feature discussions across all your NexCode projects.</p>
                </div>

                {/* Toolbar */}
                <div className="global-issues-toolbar">
                    <div className="issues-filter-group">
                        <button
                            type="button"
                            className={`issue-filter-pill ${filterStatus === "all" ? "active" : ""}`}
                            onClick={() => setFilterStatus("all")}
                        >
                            <span>All</span>
                            <span className="issue-pill-count">{issues.length}</span>
                        </button>
                        <button
                            type="button"
                            className={`issue-filter-pill ${filterStatus === "open" ? "active" : ""}`}
                            onClick={() => setFilterStatus("open")}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" />
                            </svg>
                            <span>Open</span>
                            <span className="issue-pill-count">{openCount}</span>
                        </button>
                        <button
                            type="button"
                            className={`issue-filter-pill ${filterStatus === "closed" ? "active" : ""}`}
                            onClick={() => setFilterStatus("closed")}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Closed</span>
                            <span className="issue-pill-count">{closedCount}</span>
                        </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                        {/* Filter by Repo Dropdown */}
                        {repoOptions.length > 0 && (
                            <select
                                value={selectedRepo}
                                onChange={(e) => setSelectedRepo(e.target.value)}
                                style={{
                                    background: "#090d16",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    borderRadius: "8px",
                                    padding: "0.45rem 0.85rem",
                                    color: "#cbd5e1",
                                    fontSize: "0.85rem",
                                    outline: "none"
                                }}
                            >
                                <option value="all">All Repositories</option>
                                {repoOptions.map((rName) => (
                                    <option key={rName} value={rName}>
                                        {rName}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Search Box */}
                        <div className="issues-search-box">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search all issues..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Issues List */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#94a3b8" }}>
                        <p>Loading issues list...</p>
                    </div>
                ) : (
                    <div className="global-issues-list">
                        {filteredIssues.length > 0 ? (
                            filteredIssues.map((it) => {
                                const repo = it.repository || {};
                                const isItemOpen = it.status === "open";
                                return (
                                    <article key={it._id} className="global-issue-row">
                                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem", flex: 1 }}>
                                            <div className={`issue-status-badge ${it.status}`} style={{ marginTop: "0.3rem" }}>
                                                {isItemOpen ? (
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

                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                                {repo.name && (
                                                    <span className="global-issue-repo-tag">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                                                        </svg>
                                                        <Link to={`/repo/${repo._id}`} style={{ color: "#94a3b8", textDecoration: "none" }}>
                                                            {repo.name}
                                                        </Link>
                                                    </span>
                                                )}

                                                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                                                    <Link to={`/issues/${it._id}`} className="global-issue-title-link">
                                                        {it.title}
                                                    </Link>

                                                    {/* Labels */}
                                                    {(it.labels || []).map((lbl, idx) => (
                                                        <span key={idx} className={`issue-label-pill ${lbl}`}>
                                                            {lbl}
                                                        </span>
                                                    ))}
                                                </div>

                                                <span className="issue-meta-text">
                                                    #{it._id.slice(-5)} opened by <strong>{it.author || "developer"}</strong> • {(it.comments || []).length} comments
                                                </span>
                                            </div>
                                        </div>

                                        <Link to={`/issues/${it._id}`} className="issue-title-edit-btn" style={{ textDecoration: "none" }}>
                                            View Thread
                                        </Link>
                                    </article>
                                );
                            })
                        ) : (
                            <div className="issues-empty-state">
                                <p>No issues found matching your filters.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default GlobalIssues;
