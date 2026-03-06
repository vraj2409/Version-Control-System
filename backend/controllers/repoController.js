const moongose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createRepository(req, res) {
  const { owner, name, issues, content, description, visibility } = req.body;
  try{
    if(!name){
      return res.status(400).send("Repository name is required");
    }

    if(!moongose.Types.ObjectId.isValid(owner)){
      return res.status(400).send("Invalid owner ID");
    }

    const newRepository = new Repository({
      owner,
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

  }catch(error){
    console.error("Error creating repository:", error);
    res.status(500).send("Internal server error");
  }
};

async function getAllRepositories(req, res) {
  res.send("All repositories fetched successfully!");
};

async function fetchRepositoryById(req, res) {
  res.send(`Repository with ID fetched successfully!`);
};

async function fetchRepositoryByName(req, res) {
    res.send(`Repository with name fetched successfully!`);
};

async function fetchRepositoriesForCurrentUser(req, res) {
    res.send(`Repositories for current user fetched successfully!`);
};

async function updateRepositoryById(req, res) {
    res.send(`Repository with ID updated successfully!`);
};

async function toggleVisibilityById(req, res) {    
    res.send(`Repository visibility toggled successfully!`);
};

async function deleteRepositoryById(req, res) {
    res.send(`Repository with ID deleted successfully!`);
};  

module.exports = {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoriesForCurrentUser,
  updateRepositoryById,
  toggleVisibilityById,
  deleteRepositoryById
};