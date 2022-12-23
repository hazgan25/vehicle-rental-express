const express = require("express");
const authRouter = express.Router();
const authController = require("../controllers/auth");
const { register } = require("../middlewares/validate");
const { checkToken, checkAdmin } = require("../middlewares/authorize");

authRouter.post("/register", register, authController.register);
authRouter.post(
  "/register/admin",
  checkToken,
  checkAdmin,
  register,
  authController.registerAdmin
);
authRouter.get("/verify/:pin", authController.verifyPin);
authRouter.post("/login", authController.login);
authRouter.post("/forgot/password", authController.forgotPass);
authRouter.post("/reset/password", authController.resetPass);
authRouter.delete("/logout", checkToken, authController.logout);

module.exports = authRouter;
