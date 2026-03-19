const express = require('express');
const multer = require('multer');
const commitController = require('../controllers/commitController');
const auth = require('../middleware/auth');

const commitRouter = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Get commits for a repo — owner only
commitRouter.get(
  '/commits/:repoId',
  auth,
  commitController.getCommits
);

// Upload and commit files
commitRouter.post(
  '/commits/upload',
  auth,
  upload.array('files', 20),
  commitController.commitFiles
);

module.exports = commitRouter;