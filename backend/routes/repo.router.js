const express = require('express');
const repoController = require('../controllers/repoController');
const auth = require('../middleware/auth');

const repoRouter = express.Router();

repoRouter.post('/create', auth, repoController.createRepository);
repoRouter.get('/all', auth, repoController.getAllRepositories);
repoRouter.get('/name/:name', auth, repoController.fetchRepositoryByName);
repoRouter.get('/user/:userID', auth, repoController.fetchRepositoriesForCurrentUser);
repoRouter.put('/update/:id', auth, repoController.updateRepositoryById);
repoRouter.patch('/toggle/:id', auth, repoController.toggleVisibilityById);
repoRouter.delete('/delete/:id', auth, repoController.deleteRepositoryById);
repoRouter.get('/:id', auth, repoController.fetchRepositoryById);

module.exports = repoRouter;