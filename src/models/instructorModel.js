import mongoose, { Schema } from "mongoose";

const instructorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    bio: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      default: "Not specified",
    },
    role: {
      type: String,
      enum: ["Admin", "Student", "Instructor"],
      default: "Instructor",
    },
    token: {
      type: String,
      expiry: Date(),
    },
  },
  { timestamps: true },
);

export const InstructorModel = mongoose.model("Instructor", instructorSchema);
