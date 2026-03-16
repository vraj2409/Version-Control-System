const express = require('express');
const issueController = require('../controllers/issueController');
const auth = require('../middleware/auth');

const issueRouter = express.Router();

issueRouter.post('/create', auth, issueController.createIssue);
issueRouter.get('/all', auth, issueController.getAllIssues);
issueRouter.put('/update/:id', auth, issueController.updateIssueById);
issueRouter.delete('/delete/:id', auth, issueController.deleteIssueById);
issueRouter.get('/:id', auth, issueController.getIssueById);

module.exports = issueRouter;