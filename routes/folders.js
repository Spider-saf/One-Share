const express = require('express');
const auth = require('../middleware/auth');
const Folder = require('../models/Folder');
const User = require('../models/User');
const router = express.Router();

router.post('/create', auth, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    let inviteLink = null;
    if (!isPublic) {
      inviteLink = Math.random().toString(36).substring(2, 10);
    }

    const folder = new Folder({
      name,
      description,
      isPublic,
      inviteLink,
      owner: req.userId,
      members: [req.userId]
    });

    await folder.save();
    res.status(201).json({ message: 'Folder created', folder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/public/all', async (req, res) => {
  try {
    const folders = await Folder.find({ isPublic: true })
      .populate('owner')
      .populate('members')
      .sort({ createdAt: -1 });
    
    res.json(folders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:folderId', async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.folderId)
      .populate('owner')
      .populate('members')
      .populate('photos');
    
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    res.json(folder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/join/:folderId', auth, async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.folderId);

    if (!folder || !folder.isPublic) {
      return res.status(403).json({ message: 'Cannot join this folder' });
    }

    if (folder.members.includes(req.userId)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    folder.members.push(req.userId);
    await folder.save();

    const user = await User.findById(req.userId);
    user.foldersJoined.push(req.params.folderId);
    await user.save();

    res.json({ message: 'Joined folder', folder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/join-private', auth, async (req, res) => {
  try {
    const { inviteLink } = req.body;
    const folder = await Folder.findOne({ inviteLink });

    if (!folder) {
      return res.status(404).json({ message: 'Invalid invite link' });
    }

    if (folder.members.includes(req.userId)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    folder.members.push(req.userId);
    await folder.save();

    const user = await User.findById(req.userId);
    user.foldersJoined.push(folder._id);
    await user.save();

    res.json({ message: 'Joined folder', folder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const folders = await Folder.find({
      $or: [{ owner: req.params.userId }, { members: req.params.userId }]
    }).populate('owner').populate('members');
    
    res.json(folders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
