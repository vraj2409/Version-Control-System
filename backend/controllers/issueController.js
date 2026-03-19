const Issue = require("../models/issueModel");
const Repository = require("../models/repoModel");

// ── Helper: check if current user can access a repository ─────
async function canAccessRepo(repoId, userId) {
  const repo = await Repository.findById(repoId);
  if (!repo) return { allowed: false, status: 404, message: "Repository not found" };
  if (!repo.visibility && repo.owner.toString() !== userId) {
    return { allowed: false, status: 403, message: "This repository is private." };
  }
  return { allowed: true, repo };
}

// ── Helper: check if current user owns a repository ───────────
async function isRepoOwner(repoId, userId) {
  const repo = await Repository.findById(repoId);
  if (!repo) return { isOwner: false, status: 404, message: "Repository not found" };
  if (repo.owner.toString() !== userId) {
    return { isOwner: false, status: 403, message: "Only the repository owner can do this." };
  }
  return { isOwner: true, repo };
}

async function createIssue(req, res) {
  const { title, description, repository } = req.body;
  const repoId = req.params.id || repository;

  try {
    // ── Must be able to access repo to create issue ────────────
    const access = await canAccessRepo(repoId, req.user.id);
    if (!access.allowed) {
      return res.status(access.status).json({ error: access.message });
    }

    const issue = new Issue({ title, description, repository: repoId });
    await issue.save();
    res.status(201).json(issue);
  } catch (err) {
    console.error("Error during issue creation:", err.message);
    res.status(500).send("Server error");
  }
}

async function updateIssueById(req, res) {
  const { id } = req.params;
  const { title, description, status } = req.body;
  try {
    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ error: "Issue not found!" });

    // ── Only repo owner can update issues ──────────────────────
    const ownerCheck = await isRepoOwner(issue.repository.toString(), req.user.id);
    if (!ownerCheck.isOwner) {
      return res.status(ownerCheck.status).json({ error: ownerCheck.message });
    }

    issue.title = title ?? issue.title;
    issue.description = description ?? issue.description;
    issue.status = status ?? issue.status;
    await issue.save();
    res.json(issue);
  } catch (err) {
    console.error("Error during issue update:", err.message);
    res.status(500).send("Server error");
  }
}

async function deleteIssueById(req, res) {
  const { id } = req.params;
  try {
    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ error: "Issue not found!" });

    // ── Only repo owner can delete issues ──────────────────────
    const ownerCheck = await isRepoOwner(issue.repository.toString(), req.user.id);
    if (!ownerCheck.isOwner) {
      return res.status(ownerCheck.status).json({ error: ownerCheck.message });
    }

    await Issue.findByIdAndDelete(id);
    res.json({ message: "Issue deleted" });
  } catch (err) {
    console.error("Error during issue deletion:", err.message);
    res.status(500).send("Server error");
  }
}

async function getAllIssues(req, res) {
  const repoId = req.params.id || req.query.repoId;
  try {
    // ── Must be able to access repo to see its issues ──────────
    if (repoId) {
      const access = await canAccessRepo(repoId, req.user.id);
      if (!access.allowed) {
        return res.status(access.status).json({ error: access.message });
      }
    }

    const query = repoId ? { repository: repoId } : {};
    const issues = await Issue.find(query);
    res.status(200).json(issues);
  } catch (err) {
    console.error("Error during issue fetching:", err.message);
    res.status(500).send("Server error");
  }
}

async function getIssueById(req, res) {
  const { id } = req.params;
  try {
    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ error: "Issue not found!" });

    // ── Must be able to access parent repo to view issue ───────
    const access = await canAccessRepo(issue.repository.toString(), req.user.id);
    if (!access.allowed) {
      return res.status(access.status).json({ error: access.message });
    }

    res.json(issue);
  } catch (err) {
    console.error("Error during issue fetching:", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  createIssue,
  updateIssueById,
  deleteIssueById,
  getAllIssues,
  getIssueById,
};