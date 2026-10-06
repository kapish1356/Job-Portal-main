const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    status: { type: String, default: 'Applied' }, // Applied, Viewed, etc.
    // Snapshot of user data at time of application
    applicantName: { type: String, required: true },
    applicantEmail: { type: String, required: true },
    applicantMobile: { type: String, required: true },
    applicantQualification: { type: String },
}, {
    timestamps: true,
});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
