const userController = require("../Controllers/userController");


const userRouter = require("express").Router();

userRouter.post("/", userController.signup);
userRouter.post("/login", userController.signin);
userRouter.post("/reset-password", userController.resetPassword);
userRouter.post("/new-password", userController.newPassword);
userRouter.post("/link/:email", userController.activationLink);
userRouter.get("/activate/:activationToken", userController.activateAccount);

module.exports = userRouter;