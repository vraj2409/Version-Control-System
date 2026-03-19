const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createRepository(req, res) {
  const { owner, name, issues, content, description, visibility } = req.body;
  try {
    if (!name) {
      return res.status(400).send("Repository name is required");
    }
    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).send("Invalid owner ID");
    }

    // ── Only allow creating repo for yourself ──────────────────
    if (req.user.id.toString() !== owner.toString()) {
      return res.status(403).json({ error: "You can only create repositories for your own account." });
    }

    const newRepository = new Repository({
      owner, name, issues, content, description, visibility
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
    // ── Return public repos OR repos owned by current user ─────
    const repositories = await Repository.find({
      $or: [
        { visibility: true },
        { owner: req.user.id }
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
    const repository = await Repository.findById(id)
      .populate("owner")
      .populate("issues");

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    // ── Get owner ID as string (handles populated + unpopulated)
    const ownerId = repository.owner?._id
      ? repository.owner._id.toString()
      : repository.owner?.toString();

    const currentUserId = req.user.id?.toString();

    // ── Private repo: only owner can access ────────────────────
    if (!repository.visibility && ownerId !== currentUserId) {
      return res.status(403).json({ error: "This repository is private." });
    }

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

    const ownerId = repository.owner?._id
      ? repository.owner._id.toString()
      : repository.owner?.toString();

    const currentUserId = req.user.id?.toString();

    // ── Private repo: only owner can access ────────────────────
    if (!repository.visibility && ownerId !== currentUserId) {
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
    const currentUserId = req.user.id?.toString();
    const requestedUserId = userID?.toString();

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
    if (repository.owner.toString() !== req.user.id.toString()) {
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
    if (repository.owner.toString() !== req.user.id.toString()) {
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
    if (repository.owner.toString() !== req.user.id.toString()) {
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