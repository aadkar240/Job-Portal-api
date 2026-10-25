const express = require("express");
const { body } = require("express-validator");

const {
  register,
  login,
  getMe,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateMiddleware");

const router = express.Router();

const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("role")
    .isIn(["candidate", "employer"])
    .withMessage("Role must be candidate or employer"),

  body("companyName").custom((value, { req }) => {
    if (
      req.body.role === "employer" &&
      (!value || !value.trim())
    ) {
      throw new Error("Company name is required for employers");
    }

    return true;
  }),
];

router.post(
  "/register",
  registerValidation,
  validateRequest,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  login
);

router.get("/me", protect, getMe);

module.exports = router;