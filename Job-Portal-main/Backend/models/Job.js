const mongoose = require('mongoose');

const jobSchema = mongoose.Schema({
    title: { type: String, required: true },
    details: { type: String }, // description
    type: { type: String, required: true }, // Software, Sales, Hotel, etc.
    salaryRange: { type: String },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    active: { type: Boolean, default: true },
}, {
    timestamps: true,
});

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
