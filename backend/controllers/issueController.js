const Issue = require("../models/issueModel");

async function createIssue(req, res) {
  const { title, description, repository } = req.body;
  const repoId = req.params.id || repository;
  try {
    const issue = new Issue({ title, description, repository: repoId });
    await issue.save();
    res.status(201).json(issue);
  } catch (err) {
    res.status(500).send("Server error");
  }
}

async function updateIssueById(req, res) {
  const { id } = req.params;
  const { title, description, status } = req.body;
  try {
    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ error: "Issue not found!" });
    issue.title = title ?? issue.title;
    issue.description = description ?? issue.description;
    issue.status = status ?? issue.status;
    await issue.save();
    res.json(issue);
  } catch (err) {
    res.status(500).send("Server error");
  }
}

async function deleteIssueById(req, res) {
  const { id } = req.params;
  try {
    const issue = await Issue.findByIdAndDelete(id); // ← was missing await
    if (!issue) return res.status(404).json({ error: "Issue not found!" });
    res.json({ message: "Issue deleted" });
  } catch (err) {
    res.status(500).send("Server error");
  }
}

async function getAllIssues(req, res) {
  const repoId = req.params.id || req.query.repoId;
  try {
    const issues = await Issue.find(repoId ? { repository: repoId } : {}); // ← was missing await
    res.status(200).json(issues);
  } catch (err) {
    res.status(500).send("Server error");
  }
}

async function getIssueById(req, res) {
  const { id } = req.params;
  try {
    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ error: "Issue not found!" });
    res.json(issue);
  } catch (err) {
    res.status(500).send("Server error");
  }
}
module.exports = { createIssue, updateIssueById, deleteIssueById, getAllIssues, getIssueById };