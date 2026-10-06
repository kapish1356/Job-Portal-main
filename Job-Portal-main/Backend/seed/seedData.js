const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Business = require('../models/Business');
const Job = require('../models/Job');
const connectDB = require('../config/db');

dotenv.config();

const importData = async () => { // Function to seed data
    try {
        await connectDB();

        await User.deleteMany();
        await Admin.deleteMany();
        await Business.deleteMany();
        await Job.deleteMany();

        console.log('Data Destroyed...');

        // Create Admin
        const admin = await Admin.create({
            email: 'admin@example.com',
        });

        console.log('Admin Created...');

        // Create User
        await User.create({
            name: 'John Doe',
            email: 'user@example.com',
            password: 'password123', // Will be hashed
            mobile: '1234567890',
            address: '123 Main St',
            qualification: 'B.Tech'
        });

        console.log('User Created...');

        // Create Businesses (Simulating Google Maps Data for Lucknow)
        const businesses = [];
        const types = ['IT', 'Sale & Service', 'Hotel Service', 'Education', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Real Estate', 'Logistics'];
        // Lucknow coordinates
        const centerLat = 26.8467;
        const centerLng = 80.9462;

        // Generate 500 businesses
        for (let i = 0; i < 500; i++) {
            const type = types[Math.floor(Math.random() * types.length)];

            // Random location within ~10km radius
            // 1 degree lat is ~111km, so 0.1 degree is ~11km
            const lat = centerLat + (Math.random() - 0.5) * 0.15;
            const lng = centerLng + (Math.random() - 0.5) * 0.15;

            businesses.push({
                name: `Lucknow ${type} Hub ${i + 1}`,
                description: `A premier ${type} establishment serving Lucknow.`,
                address: `Sector ${Math.floor(Math.random() * 20) + 1}, Lucknow, UP`,
                location: { lat, lng },
                adminId: admin._id,
                type: type
            });
        }

        const createdBusinesses = await Business.insertMany(businesses);
        console.log('Businesses Created...');

        // Create Jobs
        const jobs = [];
        createdBusinesses.forEach((business) => {
            // Generate 1-3 jobs per business
            const numJobs = Math.floor(Math.random() * 3) + 1;

            for (let j = 0; j < numJobs; j++) {
                const minSal = Math.floor(Math.random() * 40 + 10) * 1000; // 10k to 50k
                const maxSal = minSal + Math.floor(Math.random() * 30 + 5) * 1000; // min + 5k to 35k

                jobs.push({
                    title: `${business.type} Role ${j + 1}`,
                    details: `Opening for ${business.type} professional. Competitive salary.`,
                    type: business.type,
                    salaryRange: `${minSal / 1000}k - ${maxSal / 1000}k`,
                    salaryMin: minSal,
                    salaryMax: maxSal,
                    businessId: business._id
                });
            }
        });

        await Job.insertMany(jobs);
        console.log('Jobs Created...');

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
