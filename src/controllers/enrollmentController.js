import { CourseModel } from "../models/coursesMdl.js";
import { EnrollModel } from "../models/EnrollmentModel.js";
import { v4 as uuidv4 } from "uuid";

const createEnrollment = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { address, phone, course } = req.body;
    const userId = req.user.id;

    const courseData = await CourseModel.findById(course);
    if (!courseData) {
      return res.status(404).json({ message: "Course not found" });
    }

    const existingEnrollment = await EnrollModel.findOne({
      user: userId,
      course,
      status: "paid",
    });

    if (existingEnrollment) {
      return res
        .status(400)
        .json({ message: "You already enrolled in this course" });
    }

    const transaction_uuid = uuidv4();

    const enrollment = await EnrollModel.create({
      user: userId,
      address,
      phone,
      course,
      amount: courseData.price,
      transaction_uuid,
      status: "pending",
      payment_method: "esewa",
    });

    res.status(201).json({
      success: true,
      enrollment,
      transaction_uuid,
      amount: courseData.price,
    });
  } catch (error) {
    console.log("Create enrollment error:", error);
    res.status(500).json({ message: error.message });
  }
};

/*const verifyEsewaPayment = async (req, res) => {
  try {
    const { data } = req.query;

    const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));

    const transaction_uuid = decoded.transaction_uuid;

    const enrollment = await EnrollModel.findOne({ transaction_uuid });

    if (!enrollment) {
      return res.redirect("http://localhost:5173/failure");
    }

    enrollment.status = "paid";
    await enrollment.save();

    return res.redirect("http://localhost:5173/success");
  } catch (error) {
    console.log("Verify error:", error);
    return res.redirect("http://localhost:5173/failure");
  }
};
*/
const verifyEsewaPayment = async (req, res) => {
  try {
    const { data } = req.query;
    const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
    const transaction_uuid = decoded.transaction_uuid;

    const enrollment = await EnrollModel.findOne({ transaction_uuid });

    if (!enrollment) {
      return res.redirect("https://msw-frontend.vercel.app/failure");
    }

    enrollment.status = "paid";
    await enrollment.save();

    return res.redirect("https://msw-frontend.vercel.app/success");
  } catch (error) {
    console.log("Verify error:", error);
    return res.redirect("https://msw-frontend.vercel.app/failure");
  }
};
const getEnrollments = async (req, res) => {
  try {
    const enrollments = await EnrollModel.find({ status: "paid" })
      .populate("user", "name email")
      .populate("course")
      .sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await EnrollModel.findById(req.params.id).populate(
      "course",
    );

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await EnrollModel.findByIdAndDelete(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    res.json({ message: "Enrollment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }
    const enrollments = await EnrollModel.find({ user: userId }).populate(
      "course",
    );
    if (!enrollments) {
      return res.status(400).json({ message: "Something went wrong" });
    }
    const totalCourses = enrollments.length;
    const paidCourses = enrollments.filter(
      (paid) => paid.status === "paid",
    ).length;
    const pendingPayments = enrollments.filter(
      (pending) => pending.status === "pending",
    ).length;
    const totalAmountPaid = enrollments
      .filter((e) => e.status === "paid")
      .reduce((sum, e) => sum + e.amount, 0);
    res.status(200).json({
      message: "User details:",
      totalCourses,
      paidCourses,
      pendingPayments,
      totalAmountPaid,
      recentEnrollments: enrollments.slice(-5),
    });
  } catch (error) {
    console.log("Dashboard error:", error);
    res.status(500).json({
      message: "Failed to load dashboard",
    });
  }
};
const getTotalEarnings = async (req, res) => {
  try {
    const enrollments = await EnrollModel.find().populate("course");

    const totalEarnings = enrollments.reduce((total, enrollment) => {
      return total + (enrollment.course?.price || 0);
    }, 0);

    res.json({ totalEarnings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export {
  createEnrollment,
  verifyEsewaPayment,
  getEnrollmentById,
  getEnrollments,
  deleteEnrollment,
  getUserDashboard,
  getTotalEarnings,
};
