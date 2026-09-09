import express from "express";
import issueController from "../controllers/issueController.js";

const issueRouter = express.Router();

issueRouter.post("/create", issueController.createIssue);
issueRouter.post("/create/:id", issueController.createIssue);
issueRouter.get("/repo/:id", issueController.getAllIssues);
issueRouter.get("/all", issueController.getAllIssues);
issueRouter.get("/all/:id", issueController.getAllIssues);
issueRouter.put("/update/:id", issueController.updateIssueById);
issueRouter.delete("/delete/:id", issueController.deleteIssueById);
issueRouter.post("/:id/comments", issueController.addComment);
issueRouter.post("/comments/:id", issueController.addComment);
issueRouter.get("/:id", issueController.getIssueById);

export default issueRouter;
