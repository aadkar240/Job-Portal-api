
const Application = require("../models/Application");
const Job = require("../models/Job");

// Candidate applies for an open job
const applyForJob = async (req, res, next) => {
  try {
    const { coverLetter = "" } = req.body;

    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "This job is closed and cannot accept applications",
      });
    }

    const application = await Application.create({
      job: job._id,
      candidate: req.user._id,
      coverLetter,
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    next(error);
  }
};

// Candidate views their own applications
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({
      candidate: req.user._id,
    })
      .populate("job")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// Employer views applications for a job they own
const getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only view applications for your own jobs",
      });
    }

    const applications = await Application.find({
      job: job._id,
    })
      .populate("candidate", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// Employer updates an application's status
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const job = await Job.findById(application.job);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Associated job not found",
      });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only manage applications for your own jobs",
      });
    }

    const allowedTransitions = {
      applied: ["shortlisted", "rejected"],
      shortlisted: ["hired", "rejected"],
      hired: [],
      rejected: [],
    };

    if (!allowedTransitions[application.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change application status from ${application.status} to ${status}`,
      });
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// Candidate withdraws an application while it is still applied
const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (
      application.candidate.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only withdraw your own applications",
      });
    }

    if (application.status !== "applied") {
      return res.status(400).json({
        success: false,
        message: "Only applications with applied status can be withdrawn",
      });
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: "Application withdrawn successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
};
