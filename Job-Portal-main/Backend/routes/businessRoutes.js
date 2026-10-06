const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all businesses (Public)
// @route   GET /api/businesses
router.get('/', async (req, res) => {
    try {
        const businesses = await Business.find({});
        res.json(businesses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get top 10 hiring businesses (Public)
// @route   GET /api/businesses/top
router.get('/top', async (req, res) => {
    try {
        // For now, just return data. In real app, check 'hiring' status or job count.
        const businesses = await Business.find({}).limit(10);
        res.json(businesses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get businesses by Admin (Private)
// @route   GET /api/businesses/mine
router.get('/mine', protect, admin, async (req, res) => {
    try {
        const businesses = await Business.find({ adminId: req.user._id });
        res.json(businesses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a new business (Admin)
// @route   POST /api/businesses
router.post('/', protect, admin, async (req, res) => {
    const { name, description, address, type, lat, lng } = req.body;

    try {
        const business = new Business({
            name,
            description,
            address,
            type,
            location: { lat, lng },
            adminId: req.user._id,
        });

        const createdBusiness = await business.save();
        res.status(201).json(createdBusiness);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
