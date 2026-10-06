const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');

// @desc    Send a message
// @route   POST /api/messages
router.post('/', protect, async (req, res) => {
    const { receiverId, receiverModel, content } = req.body;

    // Logic: User -> Admin, Admin -> User.
    // req.user has _id and role.
    const senderModel = req.user.role === 'admin' ? 'Admin' : 'User';

    try {
        const message = new Message({
            senderId: req.user._id,
            receiverId,
            senderModel,
            receiverModel,
            content,
        });

        const createdMessage = await message.save();
        res.status(201).json(createdMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get Inbox (All messages where I am receiver)
// @route   GET /api/messages
router.get('/', protect, async (req, res) => {
    const receiverModel = req.user.role === 'admin' ? 'Admin' : 'User';
    try {
        let messages = await Message.find({
            receiverId: req.user._id,
            receiverModel: receiverModel
        })
            .populate('senderId', 'name email')
            .sort({ createdAt: -1 });

        // For messages from admins, fetch their business info
        const Business = require('../models/Business');
        const messagesWithBusinessInfo = await Promise.all(messages.map(async (msg) => {
            const msgObj = msg.toObject();
            if (msg.senderModel === 'Admin') {
                // Find business owned by this admin
                const business = await Business.findOne({ adminId: msg.senderId._id });
                msgObj.senderBusinessName = business?.name || 'Unknown Business';
            }
            return msgObj;
        }));

        res.json(messagesWithBusinessInfo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
router.get('/unread/count', protect, async (req, res) => {
    const receiverModel = req.user.role === 'admin' ? 'Admin' : 'User';
    try {
        const count = await Message.countDocuments({
            receiverId: req.user._id,
            receiverModel: receiverModel,
            read: false
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Mark all messages as read
// @route   PUT /api/messages/mark-read
router.put('/mark-read', protect, async (req, res) => {
    const receiverModel = req.user.role === 'admin' ? 'Admin' : 'User';
    try {
        await Message.updateMany(
            {
                receiverId: req.user._id,
                receiverModel: receiverModel,
                read: false
            },
            { read: true }
        );
        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
