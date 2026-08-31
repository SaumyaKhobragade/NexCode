import express from "express";
import issueController from "../controllers/issueController.js";

const issueRouter = express.Router();

issueRouter.post("/create", issueController.createIssue);
issueRouter.put("/update/:id", issueController.updateIssueById);
issueRouter.delete("/delete/:id", issueController.deleteIssueById);
issueRouter.get("/all", issueController.getAllIssues);
issueRouter.get("/:id", issueController.getIssueById);

export default issueRouter;
