const express = require("express");
const userRouter = require("./user.router");
const repoRouter = require("./repo.router");
const issueRouter = require("./issue.router");

const mainRouter = express.Router();

mainRouter.use("/api/auth", userRouter);
mainRouter.use("/api/repo", repoRouter);
mainRouter.use("/api/issue", issueRouter);

mainRouter.get("/", (req, res) => {
    res.send("Welcome to the Version Control System!");
});

module.exports = mainRouter;