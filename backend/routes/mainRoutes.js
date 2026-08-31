import express from "express";

import userRouter from "./userRoutes.js";
import repoRouter from "./repoRoutes.js";
import issueRouter from "./issueRoutes.js";

const mainRouter = express.Router();

mainRouter.use(userRouter);
mainRouter.use("/repositories", repoRouter);
mainRouter.use("/issues", issueRouter);

mainRouter.get("/", (req, res) => {
    res.send("Welcome to the DevHub API!");
});

export default mainRouter;
