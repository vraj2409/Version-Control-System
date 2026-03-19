const express = require("express");
const userRouter = require("./user.router");
const repoRouter = require("./repo.router");
const issueRouter = require("./issue.router");
const commitRouter = require("./commit.router");

const mainRouter = express.Router();

mainRouter.use("/api/auth", userRouter);
mainRouter.use("/api/repo", repoRouter);
mainRouter.use("/api/issue", issueRouter);
mainRouter.use("/api", require("./commit.router"));

mainRouter.get("/", (req, res) => {
    res.send("Welcome to the Version Control System!");
});

module.exports = mainRouter;