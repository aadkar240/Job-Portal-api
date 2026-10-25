
const Job = require("../models/Job");

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Employer
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      companyName,
      location,
      type,
      salary,
      skills,
    } = req.body;

    const job = await Job.create({
      title,
      description,
      companyName,
      location,
      type,
      salary,
      skills,
      postedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs with search, filters and pagination
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      type,
      minSalary,
      maxSalary,
      page = 1,
      limit = 10,
      sort = "newest",
    } = req.query;

    const filter = { status: "open" };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ];
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (type) {
      filter.type = type;
    }

    if (minSalary !== undefined || maxSalary !== undefined) {
      filter.salary = {};

      if (minSalary !== undefined) {
        filter.salary.$gte = Number(minSalary);
      }

      if (maxSalary !== undefined) {
        filter.salary.$lte = Number(maxSalary);
      }
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(limit, 10) || 10)
    );

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      salaryAsc: { salary: 1 },
      salaryDesc: { salary: -1 },
    };

    const sortBy = sortOptions[sort] || sortOptions.newest;

    const total = await Job.countDocuments(filter);

    const jobs = await Job.find(filter)
      .populate("postedBy", "name email")
      .sort(sortBy)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      count: jobs.length,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get one job
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("postedBy", "name email");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job
// @route   PATCH /api/jobs/:id
// @access  Owner employer
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update jobs you created",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "companyName",
      "location",
      "type",
      "salary",
      "skills",
      "status",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    }

    await job.save();

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Owner employer
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete jobs you created",
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Close or reopen a job
// @route   PATCH /api/jobs/:id/status
// @access  Owner employer
const updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["open", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be open or closed",
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only change jobs you created",
      });
    }

    job.status = status;
    await job.save();

    res.status(200).json({
      success: true,
      message: `Job ${status} successfully`,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get statistics for employer's jobs
// @route   GET /api/jobs/stats
// @access  Employer
const getJobStats = async (req, res, next) => {
  try {
    const stats = await Job.aggregate([
      { $match: { postedBy: req.user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = { total: 0, open: 0, closed: 0 };

    for (const item of stats) {
      result[item._id] = item.count;
      result.total += item.count;
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  updateJobStatus,
  getJobStats,
};
