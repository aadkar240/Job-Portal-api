
const express = require("express");
const { body, param } = require("express-validator");

const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
} = require("../controllers/applicationController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateMiddleware");

const router = express.Router();

// Candidate: apply for a job
router.post(
  "/job/:jobId",
  protect,
  authorizeRoles("candidate"),
  param("jobId").isMongoId().withMessage("Invalid job ID"),
  body("coverLetter")
    .optional()
    .isString()
    .withMessage("Cover letter must be text")
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Cover letter cannot exceed 2000 characters"),
  validateRequest,
  applyForJob
);

// Candidate: view their applications
router.get(
  "/my",
  protect,
  authorizeRoles("candidate"),
  getMyApplications
);

// Employer: view applications for their own job
router.get(
  "/employer/job/:jobId",
  protect,
  authorizeRoles("employer"),
  param("jobId").isMongoId().withMessage("Invalid job ID"),
  validateRequest,
  getJobApplications
);

// Employer: update application status
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("employer"),
  param("id").isMongoId().withMessage("Invalid application ID"),
  body("status")
    .isIn(["shortlisted", "rejected", "hired"])
    .withMessage("Invalid application status"),
  validateRequest,
  updateApplicationStatus
);

// Candidate: withdraw their application
router.delete(
  "/:id",
  protect,
  authorizeRoles("candidate"),
  param("id").isMongoId().withMessage("Invalid application ID"),
  validateRequest,
  withdrawApplication
);

module.exports = router;
