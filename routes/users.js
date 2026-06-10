const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const User = require('../models/User');
const Photo = require('../models/Photo');
const router = express.Router();

router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('followers')
      .populate('mates');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const photos = await Photo.find({ uploadedBy: req.params.userId, profilePhoto: true });

    res.json({
      user,
      photos,
      followerCount: user.followers.length,
      matesCount: user.mates.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/update/:userId', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    const { bio } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (bio) user.bio = bio;
    if (req.file) user.profilePicture = `/uploads/${req.file.filename}`;

    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:userId/photos', async (req, res) => {
  try {
    const photos = await Photo.find({ uploadedBy: req.params.userId, profilePhoto: true })
      .populate('uploadedBy')
      .sort({ createdAt: -1 });
    
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
