import { InstructorModel } from "../models/instructorModel.js";
import path from "path";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { comparePass, generateToken, hashedPass } from "../utils/bcrypt.js";
import { CourseModel } from "../models/courseModel.js";

const createInstructor = async (req, res) => {
  try {
    const { name, email, password, bio, experience } = req.body;

    if (!name || !email || !password || !bio || !experience) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    const existInstructor = await InstructorModel.findOne({ email });
    if (existInstructor) {
      return res.status(400).json({
        message: "Instructor already exists",
      });
    }

    const pass = hashedPass(password);
    let profileImg = "";
    if (req.file) {
      const localPath = path.resolve(req.file.path);
      const uploaded = await uploadOnCloudinary(localPath);
      profileImg = uploaded?.secure_url;
    }

    const newInstructor = await InstructorModel.create({
      name,
      email,
      password: pass,
      bio,
      profileImage: profileImg,
      experience,
    });

    res.status(201).json({
      message: "Instructor account created successfully",
      instructorDetails: newInstructor,
    });
  } catch (error) {
    console.error("Instructor creation error:", error);
    res.status(500).json({
      message: "Internal server error during instructor creation",
      error: error.message,
    });
  }
};
const getInstructors = async (req, res) => {
  try {
    const instructors = await InstructorModel.find().select("-password");
    res.status(200).json({
      message: "All instructions list",
      instructors: instructors,
    });
  } catch (error) {
    console.error("Instructor fetching error:", error);
    res.status(500).json({
      message: "Internal server error during instructor fetching",
      error: error.message,
    });
  }
};
const getMyCourses = async (req, res) => {
  try {
    const courses = await CourseModel.find({ instructor: req.user._id });
    res.status(200).json({ message: "Courses fetched successfully", courses });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching courses", error: err.message });
  }
};
const loginInstructor = async (req, res) => {
  console.log("Login data:", req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }
    const instructor = await InstructorModel.findOne({ email });
    console.log("Instructor found", instructor);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    const isMatch = comparePass(password, instructor.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }
    const token = generateToken(instructor);
    const payload = {
      id: instructor._id,
      name: instructor.name,
      email: instructor.email,
      Bio: instructor.bio,
      Experience: instructor.experience,
      profile: instructor.profileImage,
    };
    res.status(200).json({
      message: "Instructor login successfully",
      token,
      instructorDetails: payload,
    });
  } catch (error) {
    console.error("login fail error:", error);
    res.status(500).json({
      message: "Internal server error during instructor login",
      error: error.message,
    });
  }
};
const updateInstructor = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "Admin" || req.user.id !== id) {
      return res
        .status(403)
        .json({ message: "You are not allowed to update this account" });
    }
    const { name, email, password, bio, experience } = req.body;

    const updateData = {
      name,
      email,
      password,
      bio,
      experience,
    };

    if (req.file) {
      const localPath = path.resolve(req.file.path);
      const uploaded = await uploadOnCloudinary(localPath);

      if (uploaded) {
        updateData.profileImage = uploaded.secure_url;
      }
    }

    const inst = await InstructorModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { returnDocument: "after" },
    );

    if (!inst) {
      return res.status(404).json({
        message: "Instructor not found",
      });
    }

    res.status(200).json({
      message: "Instructor detail updated successfully",
      updatedDetail: inst,
    });
  } catch (error) {
    console.error("updation fail error:", error);
    res.status(500).json({
      message: "Internal server error during instructor updation",
      error: error.message,
    });
  }
};
const deleteIns = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedInst = await InstructorModel.findByIdAndDelete(id);

    if (!deletedInst) {
      return res.status(404).json({
        message: "Instructor not found",
      });
    }

    res.status(200).json({
      message: "Instructor deleted successfully",
      data: deletedInst,
    });
  } catch (error) {
    console.error("Instructor deletion fail error:", error);

    res.status(500).json({
      message: "Internal server error during instructor deletion",
      error: error.message,
    });
  }
};

export {
  createInstructor,
  loginInstructor,
  getMyCourses,
  updateInstructor,
  deleteIns,
  getInstructors,
};
