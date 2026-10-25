const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["full-time", "part-time", "internship", "remote"],
      required: true,
    },
    salary: {
      type: Number,
      required: true,
      min: [0.01, "Salary must be a positive number"],
    },
    skills: {
      type: [String],
      required: true,
      validate: {
        validator: (skills) =>
          Array.isArray(skills) && skills.length > 0,
        message: "At least one skill is required",
      },
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);