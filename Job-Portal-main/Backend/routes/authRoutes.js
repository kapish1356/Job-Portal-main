const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/emailService');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// USER REGISTER
router.post('/register', async (req, res) => {
    const { name, email, password, mobile, address, qualification } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password, mobile, address, qualification });
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                address: user.address,
                qualification: user.qualification,
                role: user.role,
                token: generateToken(user._id, 'user'),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// USER LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                address: user.address,
                qualification: user.qualification,
                role: user.role,
                token: generateToken(user._id, 'user'),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ADMIN LOGIN (OTP REQUEST)
router.post('/admin/login', async (req, res) => {
    const { email } = req.body;
    try {
        // Validate email
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // For demo, we auto-create admin if not exists, or just check
        let admin = await Admin.findOne({ email });
        if (!admin) {
            // Create one for demo purposes if it doesn't exist
            admin = await Admin.create({ email });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        admin.otp = otp;
        admin.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        await admin.save();

        // Send OTP via email
        const emailSent = await sendOTPEmail(email, otp);

        if (emailSent) {
            console.log(`✅ OTP sent to ${email}: ${otp}`);
            res.json({
                message: 'OTP sent to your email successfully',
                email
            });
        } else {
            console.log(`⚠️ Email failed, but OTP generated: ${otp}`);
            res.json({
                message: 'OTP generated but email service failed. Check console for OTP.',
                email,
                otp // Include OTP in response as fallback (remove in production)
            });
        }
    } catch (error) {
        console.error('Error in admin login:', error);
        res.status(500).json({ message: error.message });
    }
});

// ADMIN VERIFY OTP
router.post('/admin/verify', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (admin && admin.otp === otp && admin.otpExpires > Date.now()) {
            admin.otp = undefined;
            admin.otpExpires = undefined;
            await admin.save();

            res.json({
                _id: admin._id,
                email: admin.email,
                role: 'admin',
                token: generateToken(admin._id, 'admin'),
            });
        } else {
            res.status(401).json({ message: 'Invalid or expired OTP' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
