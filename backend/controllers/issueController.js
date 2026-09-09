import mongoose from "mongoose";

import Issue from "../models/issueModel.js";
import Repository from "../models/repoModel.js";

async function createIssue(req, res) {
    const { title, description, author, labels } = req.body;
    const repoId = req.params.id || req.body.repository;

    try {
        if (!title || !description) {
            return res.status(400).json({ error: "Title and description are required!" });
        }

        if (!repoId || !mongoose.Types.ObjectId.isValid(repoId)) {
            return res.status(400).json({ error: "Valid repository ID is required!" });
        }

        const issue = new Issue({
            title,
            description,
            repository: repoId,
            status: "open",
            author: author || "developer",
            labels: labels || [],
        });

        await issue.save();

        // Push issue to Repository document
        await Repository.findByIdAndUpdate(repoId, {
            $addToSet: { issues: issue._id },
        });

        res.status(201).json(issue);
    } catch (err) {
        console.error("Error during issue creation : ", err.message);
        res.status(500).send("Server error");
    }
}

async function updateIssueById(req, res) {
    const { id } = req.params;
    const { title, description, status, labels } = req.body;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid issue ID" });
        }

        const issue = await Issue.findById(id);

        if (!issue) {
            return res.status(404).json({ error: "Issue not found!" });
        }

        if (title !== undefined) issue.title = title;
        if (description !== undefined) issue.description = description;
        if (status !== undefined) issue.status = status;
        if (labels !== undefined) issue.labels = labels;

        await issue.save();

        res.json(issue);
    } catch (err) {
        console.error("Error during issue updation : ", err.message);
        res.status(500).send("Server error");
    }
}

async function deleteIssueById(req, res) {
    const { id } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid issue ID" });
        }

        const issue = await Issue.findByIdAndDelete(id);

        if (!issue) {
            return res.status(404).json({ error: "Issue not found!" });
        }

        // Remove from Repository
        if (issue.repository) {
            await Repository.findByIdAndUpdate(issue.repository, {
                $pull: { issues: issue._id },
            });
        }

        res.json({ message: "Issue deleted successfully!" });
    } catch (err) {
        console.error("Error during issue deletion : ", err.message);
        res.status(500).send("Server error");
    }
}

async function getAllIssues(req, res) {
    const repoId = req.params.id || req.query.repository;

    try {
        const query = repoId && mongoose.Types.ObjectId.isValid(repoId)
            ? { repository: repoId }
            : {};

        const issues = await Issue.find(query).populate("repository").sort({ createdAt: -1 });
        res.status(200).json(issues || []);
    } catch (err) {
        console.error("Error during issue fetching : ", err.message);
        res.status(500).send("Server error");
    }
}

async function getIssueById(req, res) {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid issue ID" });
        }

        const issue = await Issue.findById(id).populate({
            path: "repository",
            populate: { path: "owner" }
        });

        if (!issue) {
            return res.status(404).json({ error: "Issue not found!" });
        }

        res.json(issue);
    } catch (err) {
        console.error("Error during issue fetch : ", err.message);
        res.status(500).send("Server error");
    }
}

async function addComment(req, res) {
    const { id } = req.params;
    const { text, author } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid issue ID" });
        }

        if (!text) {
            return res.status(400).json({ error: "Comment text is required!" });
        }

        const issue = await Issue.findById(id);
        if (!issue) {
            return res.status(404).json({ error: "Issue not found!" });
        }

        const newComment = {
            text,
            author: author || "developer",
            createdAt: new Date(),
        };

        issue.comments.push(newComment);
        await issue.save();

        res.status(201).json(issue);
    } catch (err) {
        console.error("Error during adding comment : ", err.message);
        res.status(500).send("Server error");
    }
}

export default { createIssue, updateIssueById, deleteIssueById, getAllIssues, getIssueById, addComment };
