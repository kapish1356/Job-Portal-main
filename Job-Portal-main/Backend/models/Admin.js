const mongoose = require('mongoose');

const adminSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    // For simulation, we might store the current valid OTP, or just handle it in memory/logs
    // We'll store a 'tempOtp' for verification if needed, or just rely on the flow
    otp: { type: String },
    otpExpires: { type: Date },
}, {
    timestamps: true,
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
