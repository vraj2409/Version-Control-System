const express = require("express");
const userController = require("../controllers/userController");
const auth = require('../middleware/auth');

const userRouter = express.Router();

// Public
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);

// Protected
userRouter.get("/allUsers", auth, userController.getAllUsers);
userRouter.get("/profile", auth, userController.getUserProfileFromToken);
userRouter.get("/userProfile/:id", auth, userController.getUserProfile);
userRouter.put("/updateProfile/:id", auth, userController.updateUserProfile);
userRouter.delete("/deleteProfile/:id", auth, userController.deleteUserProfile);

module.exports = userRouter;