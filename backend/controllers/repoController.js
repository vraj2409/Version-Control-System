const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

// ── Helper: normalize any owner/user ID to plain string ───────
function toStr(id) {
  if (!id) return '';
  if (typeof id === 'object' && id._id) return id._id.toString();
  return id.toString();
}

async function createRepository(req, res) {
  const { name, issues, content, description, visibility } = req.body;
  try {
    if (!name) {
      return res.status(400).send("Repository name is required");
    }

    // ── Always use the authenticated user as owner ─────────────
    const ownerId = req.user.id || req.user._id;

    const newRepository = new Repository({
      owner: ownerId,
      name,
      issues,
      content,
      description,
      visibility
    });

    const result = await newRepository.save();
    res.status(201).json({
      module: "Repository Created!!",
      repositoryID: result._id,
    });
  } catch (error) {
    console.error("Error creating repository:", error);
    res.status(500).send("Internal server error");
  }
}

async function getAllRepositories(req, res) {
  try {
    const currentUserId = req.user.id || req.user._id;

    // ── Return public repos OR repos owned by current user ─────
    const repositories = await Repository.find({
      $or: [
        { visibility: true },
        { owner: currentUserId }
      ]
    })
      .populate("owner")
      .populate("issues");

    res.json(repositories);
  } catch (err) {
    console.error("Error during fetching repositories:", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoryById(req, res) {
  const { id } = req.params;
  try {
    // ── First fetch WITHOUT populate to get raw owner ObjectId ─
    const repositoryRaw = await Repository.findById(id);

    if (!repositoryRaw) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    // ── Compare raw owner ID (never null even if user not found)
    const ownerId = repositoryRaw.owner?.toString() || '';
    const currentUserId = toStr(req.user.id || req.user._id);

    const isPublic = repositoryRaw.visibility === true;
    const isOwner = ownerId === currentUserId;

    if (!isPublic && !isOwner) {
      return res.status(403).json({ error: "This repository is private." });
    }

    // ── Now fetch WITH populate only for the response ──────────
    const repository = await Repository.findById(id)
      .populate("owner")
      .populate("issues");

    res.json(repository);
  } catch (err) {
    console.error("Error during fetching repository:", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoryByName(req, res) {
  const { name } = req.params;
  try {
    const repository = await Repository.findOne({ name })
      .populate("owner")
      .populate("issues");

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    // ── Normalize both IDs to plain strings ────────────────────
    const ownerId = toStr(repository.owner);
    const currentUserId = toStr(req.user.id || req.user._id);

    const isPublic = repository.visibility === true;
    const isOwner = ownerId === currentUserId;

    // ── Private repo: block non-owners ────────────────────────
    if (!isPublic && !isOwner) {
      return res.status(403).json({ error: "This repository is private." });
    }

    res.json(repository);
  } catch (err) {
    console.error("Error during fetching repository:", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoriesForCurrentUser(req, res) {
  const { userID } = req.params;
  try {
    const currentUserId = toStr(req.user.id || req.user._id);
    const requestedUserId = toStr(userID);

    let query;

    if (requestedUserId === currentUserId) {
      // ── Own profile: return ALL repos (public + private) ─────
      query = { owner: userID };
    } else {
      // ── Other user's profile: only public repos ──────────────
      query = { owner: userID, visibility: true };
    }

    const repositories = await Repository.find(query);

    if (!repositories || repositories.length === 0) {
      return res.status(404).json({ error: "User Repositories not found!" });
    }

    res.json({ message: "Repositories found!", repositories });
  } catch (err) {
    console.error("Error during fetching user repositories:", err.message);
    res.status(500).send("Server error");
  }
}

async function updateRepositoryById(req, res) {
  const { id } = req.params;
  const { content, description } = req.body;
  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    // ── Only owner can update ──────────────────────────────────
    const ownerId = toStr(repository.owner);
    const currentUserId = toStr(req.user.id || req.user._id);

    if (ownerId !== currentUserId) {
      return res.status(403).json({ error: "Only the repository owner can update it." });
    }

    if (content) repository.content.push(content);
    if (description !== undefined) repository.description = description;

    const updatedRepository = await repository.save();
    res.json({
      message: "Repository updated successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during updating repository:", err.message);
    res.status(500).send("Server error");
  }
}

async function toggleVisibilityById(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    // ── Only owner can toggle visibility ───────────────────────
    const ownerId = toStr(repository.owner);
    const currentUserId = toStr(req.user.id || req.user._id);

    if (ownerId !== currentUserId) {
      return res.status(403).json({ error: "Only the repository owner can change visibility." });
    }

    repository.visibility = !repository.visibility;
    const updatedRepository = await repository.save();

    res.json({
      message: "Repository visibility toggled successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during toggling visibility:", err.message);
    res.status(500).send("Server error");
  }
}

async function deleteRepositoryById(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    // ── Only owner can delete ──────────────────────────────────
    const ownerId = toStr(repository.owner);
    const currentUserId = toStr(req.user.id || req.user._id);

    if (ownerId !== currentUserId) {
      return res.status(403).json({ error: "Only the repository owner can delete it." });
    }

    await Repository.findByIdAndDelete(id);
    res.json({ message: "Repository deleted successfully!" });
  } catch (err) {
    console.error("Error during deleting repository:", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoriesForCurrentUser,
  updateRepositoryById,
  toggleVisibilityById,
  deleteRepositoryById,
};