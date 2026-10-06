const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Business = require('../models/Business');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all jobs with filters (Public)
// @route   GET /api/jobs
router.get('/', async (req, res) => {
    const { keyword, type, location, minSalary, maxSalary, lat, lng, radius } = req.query;

    let query = { active: true };

    if (type) {
        query.type = { $regex: type, $options: 'i' };
    }

    // Keyword search
    if (keyword) {
        query.$or = [
            { title: { $regex: keyword, $options: 'i' } },
            { details: { $regex: keyword, $options: 'i' } }
        ];
    }

    // Salary Range Filtering
    // Jobs that fit within the user's requested range
    // or simply: jobs where salaryMin >= requestedMin AND salaryMax <= requestedMax
    if (minSalary) {
        query.salaryMin = { $gte: Number(minSalary) };
    }
    if (maxSalary) {
        query.salaryMax = { $lte: Number(maxSalary) };
    }

    try {
        let businessIds = null;

        // Location Filtering (Proximity)
        if (lat && lng) {
            const rad = radius ? Number(radius) : 10; // default 10km
            // Simple distance check: fetch all businesses, filter by Haversine, then get IDs
            // Note: For large datasets, use MongoDB $near or $geoWithin with 2dsphere index.
            // Since we upgraded the data to ~100 businesses, fetching all is still okay for this prototype.

            const allBusinesses = await Business.find({});
            const nearbyBusinesses = allBusinesses.filter(b => {
                const dist = getDistanceFromLatLonInKm(Number(lat), Number(lng), b.location.lat, b.location.lng);
                return dist <= rad;
            });

            const nearbyIds = nearbyBusinesses.map(b => b._id);
            if (query.businessId) {
                // If there's already a businessId filter (unlikely here but possible), intersection
                // implementation skipped for simplicity unless needed
            }
            query.businessId = { $in: nearbyIds };
        } else if (location) {
            // Text based location search (fallback)
            const businesses = await Business.find({
                address: { $regex: location, $options: 'i' }
            }).select('_id');
            const locIds = businesses.map(b => b._id);

            // If we already filtered by lat/lng, we intersect, but here it's asking for either/or usually.
            // If both, existing logic overwrites. Let's assume if lat/lng is provided, we use that.
            if (!query.businessId) {
                query.businessId = { $in: locIds };
            }
        }

        const jobs = await Job.find(query).populate('businessId');
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Haversine Formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

router.post('/', protect, admin, async (req, res) => {
    const { title, details, type, salaryRange, businessId } = req.body;

    try {
        // Verify business belongs to admin
        const business = await Business.findById(businessId);
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }
        if (business.adminId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to add job to this business' });
        }

        // Parse salary range to extract min and max
        let salaryMin = null;
        let salaryMax = null;

        if (salaryRange) {
            // Try to extract numbers from salary range string
            // Examples: "20000-50000", "20k-50k", "20000", etc.
            const numbers = salaryRange.match(/\d+/g);
            if (numbers && numbers.length > 0) {
                salaryMin = parseInt(numbers[0]);
                salaryMax = numbers.length > 1 ? parseInt(numbers[1]) : salaryMin * 2;
            }
        }

        const job = new Job({
            title,
            details,
            type: type || business.type, // Use business type if not provided
            salaryRange,
            salaryMin,
            salaryMax,
            businessId,
            active: true
        });

        const createdJob = await job.save();
        res.status(201).json(createdJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
