import express from "express";
import {
  editUser,
  getMe,
  getMyCourses,
  getUsers,
  loginUser,
  myPayments,
  registerUser,
} from "../controllers/userController.js";
import { upload } from "../middlewares/upload.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const userRouter = express.Router();

userRouter
  .post("/register", upload.single("profile"), registerUser)
  .post("/login", loginUser)
  .get("/my-courses", authMiddleware(["Student"]), getMyCourses)
  .get("/get-me", authMiddleware(), getMe)
  .get("/get-all", getUsers)
  .put("/edit/:id", editUser)
  .get("/my-payments", authMiddleware(["Student"]), myPayments);
export default userRouter;
