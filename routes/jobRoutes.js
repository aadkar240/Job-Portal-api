
const express = require("express");
const { body, param, query } = require("express-validator");

const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  updateJobStatus,
  getJobStats,
} = require("../controllers/jobController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateMiddleware");

const router = express.Router();

const validateJob = [
  body("title").trim().notEmpty().withMessage("Job title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("companyName").trim().notEmpty().withMessage("Company name is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("type")
    .isIn(["full-time", "part-time", "internship", "remote"])
    .withMessage("Invalid job type"),
  body("salary").isFloat({ min: 1 }).withMessage("Salary must be positive"),
  body("skills")
    .isArray({ min: 1 })
    .withMessage("Provide at least one skill"),
];

router.get(
  "/stats",
  protect,
  authorizeRoles("employer"),
  getJobStats
);

router
  .route("/")
  .get(getJobs)
  .post(
    protect,
    authorizeRoles("employer"),
    validateJob,
    validateRequest,
    createJob
  );

router.get(
  "/:id",
  param("id").isMongoId().withMessage("Invalid job ID"),
  validateRequest,
  getJobById
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("employer"),
  param("id").isMongoId().withMessage("Invalid job ID"),
  body("status").isIn(["open", "closed"]).withMessage("Invalid status"),
  validateRequest,
  updateJobStatus
);

router.patch(
  "/:id",
  protect,
  authorizeRoles("employer"),
  param("id").isMongoId().withMessage("Invalid job ID"),
  validateRequest,
  updateJob
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("employer"),
  param("id").isMongoId().withMessage("Invalid job ID"),
  validateRequest,
  deleteJob
);

module.exports = router;
