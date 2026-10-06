const mongoose = require('mongoose');

const businessSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    address: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    type: { type: String }, // e.g. IT, Service, etc.
}, {
    timestamps: true,
});

const Business = mongoose.model('Business', businessSchema);
module.exports = Business;
