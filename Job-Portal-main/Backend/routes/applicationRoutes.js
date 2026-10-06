const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const Business = require('../models/Business');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Apply to a job (User)
// @route   POST /api/applications
router.post('/', protect, async (req, res) => {
    const { jobId } = req.body;

    try {
        // Check for existing application
        const existingApp = await Application.findOne({ userId: req.user._id, jobId });
        if (existingApp) {
            return res.status(400).json({ message: 'You have already applied to this job' });
        }

        const application = new Application({
            userId: req.user._id,
            jobId,
            status: 'Applied',
            applicantName: req.user.name,
            applicantEmail: req.user.email,
            applicantMobile: req.user.mobile,
            applicantQualification: req.user.qualification || 'Not specified'
        });

        const createdApp = await application.save();
        res.status(201).json(createdApp);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get logged in user's applications
// @route   GET /api/applications/mine
router.get('/mine', protect, async (req, res) => {
    try {
        const applications = await Application.find({ userId: req.user._id })
            .populate({
                path: 'jobId',
                populate: { path: 'businessId' }
            });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get applications for a job (Admin/Recruiter)
// @route   GET /api/applications/job/:jobId
// NOTE: Must verify that the Admin owns the business listing the job
router.get('/job/:jobId', protect, admin, async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId).populate('businessId');
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.businessId.adminId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to view these applications' });
        }

        const applications = await Application.find({ jobId: req.params.jobId })
            .populate('userId', '-password'); // Populate user profile info
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all applicants for admin's businesses
// @route   GET /api/applications/admin/all
router.get('/admin/all', protect, admin, async (req, res) => {
    try {
        // Find all businesses owned by this admin
        const businesses = await Business.find({ adminId: req.user._id });
        const businessIds = businesses.map(b => b._id);

        // Find all jobs for those businesses
        const jobs = await Job.find({ businessId: { $in: businessIds } });
        const jobIds = jobs.map(j => j._id);

        // Find all applications for those jobs
        const applications = await Application.find({ jobId: { $in: jobIds } })
            .populate('userId', 'name email mobile qualification')
            .populate({
                path: 'jobId',
                populate: { path: 'businessId', select: 'name' }
            })
            .sort({ createdAt: -1 });

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
