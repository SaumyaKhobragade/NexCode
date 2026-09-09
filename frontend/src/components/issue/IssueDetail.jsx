import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import "./issue.css";

const PRESET_LABELS = [
    { name: "bug", color: "bug" },
    { name: "enhancement", color: "enhancement" },
    { name: "documentation", color: "documentation" },
    { name: "high-priority", color: "high-priority" },
    { name: "help-wanted", color: "help-wanted" }
];

const IssueDetail = () => {
    const { id, issueId } = useParams();
    const targetId = issueId || id;
    const navigate = useNavigate();

    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Comment form
    const [commentText, setCommentText] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    // Edit title & desc
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState("");
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [editedDesc, setEditedDesc] = useState("");

    const fetchIssue = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`http://localhost:3000/issues/${targetId}`);
            setIssue(res.data);
            setEditedTitle(res.data.title);
            setEditedDesc(res.data.description);
        } catch (err) {
            console.error("Error loading issue:", err);
            setError("Issue not found or failed to load.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (targetId) {
            fetchIssue();
        }
    }, [targetId]);

    // Handle Comment Submit
    const handleAddComment = async (shouldToggleStatus = false) => {
        if (!commentText.trim() && !shouldToggleStatus) return;

        try {
            setSubmittingComment(true);
            const userHandle = localStorage.getItem("userHandle") || "developer";

            let updatedIssue = issue;

            // Submit comment if text provided
            if (commentText.trim()) {
                const commentRes = await axios.post(`http://localhost:3000/issues/${targetId}/comments`, {
                    text: commentText.trim(),
                    author: userHandle
                });
                updatedIssue = commentRes.data;
            }

            // If toggle status requested
            if (shouldToggleStatus) {
                const nextStatus = issue.status === "open" ? "closed" : "open";
                const statusRes = await axios.put(`http://localhost:3000/issues/update/${targetId}`, {
                    status: nextStatus
                });
                updatedIssue = {
                    ...updatedIssue,
                    status: statusRes.data.status
                };
            }

            setIssue(updatedIssue);
            setCommentText("");
        } catch (err) {
            console.error("Error submitting comment/status:", err);
            alert("Failed to submit comment or update issue.");
        } finally {
            setSubmittingComment(false);
        }
    };

    // Toggle Issue Status
    const handleToggleStatus = async () => {
        const nextStatus = issue.status === "open" ? "closed" : "open";
        try {
            const res = await axios.put(`http://localhost:3000/issues/update/${targetId}`, {
                status: nextStatus
            });
            setIssue((prev) => ({ ...prev, status: res.data.status }));
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    // Save Title
    const handleSaveTitle = async () => {
        if (!editedTitle.trim()) return;
        try {
            const res = await axios.put(`http://localhost:3000/issues/update/${targetId}`, {
                title: editedTitle.trim()
            });
            setIssue((prev) => ({ ...prev, title: res.data.title }));
            setIsEditingTitle(false);
        } catch (err) {
            console.error("Error updating title:", err);
        }
    };

    // Save Description
    const handleSaveDesc = async () => {
        try {
            const res = await axios.put(`http://localhost:3000/issues/update/${targetId}`, {
                description: editedDesc.trim()
            });
            setIssue((prev) => ({ ...prev, description: res.data.description }));
            setIsEditingDesc(false);
        } catch (err) {
            console.error("Error updating description:", err);
        }
    };

    // Toggle Label
    const handleToggleLabel = async (labelName) => {
        const currentLabels = issue.labels || [];
        const nextLabels = currentLabels.includes(labelName)
            ? currentLabels.filter((l) => l !== labelName)
            : [...currentLabels, labelName];

        try {
            const res = await axios.put(`http://localhost:3000/issues/update/${targetId}`, {
                labels: nextLabels
            });
            setIssue((prev) => ({ ...prev, labels: res.data.labels }));
        } catch (err) {
            console.error("Error updating labels:", err);
        }
    };

    // Delete Issue
    const handleDeleteIssue = async () => {
        if (!window.confirm("Are you sure you want to permanently delete this issue?")) return;
        try {
            await axios.delete(`http://localhost:3000/issues/delete/${targetId}`);
            alert("Issue deleted successfully.");
            const repoId = issue.repository?._id || issue.repository;
            if (repoId) {
                navigate(`/repo/${repoId}`);
            } else {
                navigate("/issues");
            }
        } catch (err) {
            console.error("Error deleting issue:", err);
            alert("Failed to delete issue.");
        }
    };

    if (loading) {
        return (
            <div className="issue-page-root">
                <Navbar />
                <div style={{ textAlign: "center", padding: "5rem 1rem", color: "#94a3b8" }}>
                    <p>Loading issue details...</p>
                </div>
            </div>
        );
    }

    if (error || !issue) {
        return (
            <div className="issue-page-root">
                <Navbar />
                <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
                    <h3 style={{ color: "#f87171", marginBottom: "1rem" }}>{error || "Issue not found."}</h3>
                    <Link to="/issues" className="repo-back-btn">
                        Back to Issues
                    </Link>
                </div>
            </div>
        );
    }

    const repo = issue.repository || {};
    const repoOwnerName = repo.owner?.username || "developer";
    const repoName = repo.name || "repository";
    const repoId = repo._id || repo;
    const isOpen = issue.status === "open";
    const issueShortId = issue._id.slice(-5);

    return (
        <div className="issue-page-root">
            <Navbar />

            <main className="issue-container">
                {/* Header Card */}
                <section className="issue-header-card">
                    <nav className="issue-breadcrumb-nav">
                        <Link to="/" className="issue-crumb-link">
                            NexCode
                        </Link>
                        <span>/</span>
                        <Link to={`/repo/${repoId}`} className="issue-crumb-link">
                            {repoName}
                        </Link>
                        <span>/</span>
                        <Link to={`/repo/${repoId}`} className="issue-crumb-link">
                            Issues
                        </Link>
                        <span>/</span>
                        <span style={{ color: "#f8fafc" }}>#{issueShortId}</span>
                    </nav>

                    <div className="issue-title-row">
                        {isEditingTitle ? (
                            <div style={{ display: "flex", gap: "0.75rem", flex: 1, alignItems: "center" }}>
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    style={{
                                        flex: 1,
                                        background: "#090d16",
                                        border: "1px solid #0ea5e9",
                                        borderRadius: "8px",
                                        padding: "0.5rem 0.85rem",
                                        color: "#f8fafc",
                                        fontSize: "1.25rem",
                                        fontWeight: 600,
                                        outline: "none"
                                    }}
                                />
                                <button type="button" className="comment-submit-btn" onClick={handleSaveTitle}>
                                    Save
                                </button>
                                <button
                                    type="button"
                                    className="comment-toggle-state-btn"
                                    onClick={() => {
                                        setEditedTitle(issue.title);
                                        setIsEditingTitle(false);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <h1 className="issue-title-h1">
                                <span>{issue.title}</span>
                                <span className="issue-number-tag">#{issueShortId}</span>
                            </h1>
                        )}

                        {!isEditingTitle && (
                            <button
                                type="button"
                                className="issue-title-edit-btn"
                                onClick={() => setIsEditingTitle(true)}
                            >
                                Edit Title
                            </button>
                        )}
                    </div>

                    <div className="issue-meta-row">
                        <span className={`issue-status-pill ${isOpen ? "open" : "closed"}`}>
                            {isOpen ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                                </svg>
                            ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            )}
                            <span>{isOpen ? "Open" : "Closed"}</span>
                        </span>

                        <span>
                            Opened by <strong style={{ color: "#e2e8f0" }}>{issue.author || "developer"}</strong>
                        </span>
                        <span>•</span>
                        <span>{(issue.comments || []).length} comments</span>
                        <span>•</span>
                        <span>{new Date(issue.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                </section>

                {/* Main Grid: Discussion Thread & Sidebar */}
                <div className="issue-content-grid">
                    {/* Column 1: Discussion Thread */}
                    <div className="issue-thread-column">
                        {/* Original Post Box */}
                        <article className="issue-card-box author-post">
                            <div className="issue-card-header">
                                <div className="issue-user-info">
                                    <div className="issue-avatar-circle">
                                        {(issue.author || "D")[0].toUpperCase()}
                                    </div>
                                    <span className="issue-author-name">{issue.author || "developer"}</span>
                                    <span className="issue-author-badge">Author</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <span className="issue-date-tag">
                                        {new Date(issue.createdAt || Date.now()).toLocaleString()}
                                    </span>
                                    <button
                                        type="button"
                                        style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: "0.8rem" }}
                                        onClick={() => setIsEditingDesc(!isEditingDesc)}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>

                            <div className="issue-card-body">
                                {isEditingDesc ? (
                                    <div>
                                        <textarea
                                            rows={4}
                                            value={editedDesc}
                                            onChange={(e) => setEditedDesc(e.target.value)}
                                            style={{
                                                width: "100%",
                                                boxSizing: "border-box",
                                                background: "#090d16",
                                                border: "1px solid #0ea5e9",
                                                borderRadius: "8px",
                                                padding: "0.75rem",
                                                color: "#f8fafc",
                                                fontSize: "0.92rem",
                                                fontFamily: "inherit",
                                                marginBottom: "0.75rem"
                                            }}
                                        />
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button type="button" className="comment-submit-btn" onClick={handleSaveDesc}>
                                                Update Description
                                            </button>
                                            <button
                                                type="button"
                                                className="comment-toggle-state-btn"
                                                onClick={() => {
                                                    setEditedDesc(issue.description);
                                                    setIsEditingDesc(false);
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ margin: 0, whiteSpace: "pre-line" }}>{issue.description}</p>
                                )}
                            </div>
                        </article>

                        {/* Comments Stream */}
                        {(issue.comments || []).map((comm, idx) => (
                            <article key={idx} className="issue-card-box">
                                <div className="issue-card-header">
                                    <div className="issue-user-info">
                                        <div className="issue-avatar-circle" style={{ background: "#334155" }}>
                                            {(comm.author || "D")[0].toUpperCase()}
                                        </div>
                                        <span className="issue-author-name">{comm.author || "developer"}</span>
                                    </div>
                                    <span className="issue-date-tag">
                                        {new Date(comm.createdAt || Date.now()).toLocaleString()}
                                    </span>
                                </div>
                                <div className="issue-card-body">
                                    <p style={{ margin: 0, whiteSpace: "pre-line" }}>{comm.text}</p>
                                </div>
                            </article>
                        ))}

                        {/* Add Comment Form Box */}
                        <div className="comment-form-box">
                            <h4 className="comment-form-title">Leave a comment</h4>
                            <textarea
                                className="comment-textarea"
                                placeholder="Add your constructive technical notes or reproduction steps..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />

                            <div className="comment-actions-bar">
                                <button
                                    type="button"
                                    className="comment-toggle-state-btn"
                                    disabled={submittingComment}
                                    onClick={() => handleAddComment(true)}
                                >
                                    {isOpen ? "Close Issue & Comment" : "Reopen Issue & Comment"}
                                </button>

                                <button
                                    type="button"
                                    className="comment-submit-btn"
                                    disabled={submittingComment || !commentText.trim()}
                                    onClick={() => handleAddComment(false)}
                                >
                                    {submittingComment ? "Submitting..." : "Comment"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Sidebar Widgets */}
                    <aside className="issue-sidebar-column">
                        {/* Repository Info Widget */}
                        <div className="issue-side-widget">
                            <h4 className="side-widget-title">Repository</h4>
                            <Link to={`/repo/${repoId}`} className="side-repo-link">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                                    <path d="M6 6h10" />
                                    <path d="M6 10h10" />
                                </svg>
                                <span>{repoName}</span>
                            </Link>
                            <p style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "0.4rem", margin: 0 }}>
                                {repo.description || "Cloud repository on NexCode"}
                            </p>
                        </div>

                        {/* Status Manager */}
                        <div className="issue-side-widget">
                            <h4 className="side-widget-title">Status</h4>
                            <button
                                type="button"
                                className="comment-toggle-state-btn"
                                style={{ width: "100%", justifyContent: "center" }}
                                onClick={handleToggleStatus}
                            >
                                Switch to {isOpen ? "Closed" : "Open"}
                            </button>
                        </div>

                        {/* Labels Manager */}
                        <div className="issue-side-widget">
                            <h4 className="side-widget-title">Labels</h4>
                            <div className="issue-labels-wrap">
                                {(issue.labels || []).length > 0 ? (
                                    issue.labels.map((lbl, idx) => (
                                        <span key={idx} className={`issue-label-pill ${lbl}`}>
                                            {lbl}
                                        </span>
                                    ))
                                ) : (
                                    <span style={{ fontSize: "0.82rem", color: "#64748b" }}>None yet</span>
                                )}
                            </div>

                            <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "0.85rem 0 0.35rem" }}>
                                Click to toggle labels:
                            </p>
                            <div className="preset-labels-picker">
                                {PRESET_LABELS.map((p) => {
                                    const isSelected = (issue.labels || []).includes(p.name);
                                    return (
                                        <button
                                            key={p.name}
                                            type="button"
                                            className={`preset-label-btn ${isSelected ? "selected" : ""}`}
                                            onClick={() => handleToggleLabel(p.name)}
                                        >
                                            {isSelected ? `✓ ${p.name}` : `+ ${p.name}`}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="issue-side-widget" style={{ borderColor: "rgba(239, 68, 68, 0.2)" }}>
                            <h4 className="side-widget-title" style={{ color: "#f87171" }}>Danger Zone</h4>
                            <button
                                type="button"
                                className="side-delete-issue-btn"
                                onClick={handleDeleteIssue}
                            >
                                Delete Issue
                            </button>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default IssueDetail;
