const express = require('express');
const auth = require('../middleware/auth');
const Mate = require('../models/Mate');
const User = require('../models/User');
const router = express.Router();

router.post('/request/:targetUserId', auth, async (req, res) => {
  try {
    if (req.userId === req.params.targetUserId) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    const targetUser = await User.findById(req.params.targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingRequest = await Mate.findOne({
      from: req.userId,
      to: req.params.targetUserId
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    const mateRequest = new Mate({
      from: req.userId,
      to: req.params.targetUserId
    });

    await mateRequest.save();
    res.status(201).json({ message: 'Mate request sent', mateRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/accept/:mateRequestId', auth, async (req, res) => {
  try {
    const mateRequest = await Mate.findById(req.params.mateRequestId);

    if (!mateRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (mateRequest.to.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    mateRequest.status = 'accepted';
    mateRequest.respondedAt = new Date();
    await mateRequest.save();

    const user1 = await User.findById(mateRequest.from);
    const user2 = await User.findById(mateRequest.to);

    if (!user1.mates.includes(user2._id)) {
      user1.mates.push(user2._id);
      user2.mates.push(user1._id);
      await user1.save();
      await user2.save();
    }

    res.json({ message: 'Mate request accepted', mateRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/reject/:mateRequestId', auth, async (req, res) => {
  try {
    const mateRequest = await Mate.findById(req.params.mateRequestId);

    if (!mateRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (mateRequest.to.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    mateRequest.status = 'rejected';
    mateRequest.respondedAt = new Date();
    await mateRequest.save();

    res.json({ message: 'Mate request rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/requests/pending', auth, async (req, res) => {
  try {
    const requests = await Mate.find({
      to: req.userId,
      status: 'pending'
    }).populate('from');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/list/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('mates');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ mates: user.mates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
