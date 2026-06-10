const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const Photo = require('../models/Photo');
const Folder = require('../models/Folder');
const sharp = require('sharp');
const fs = require('fs');
const router = express.Router();

router.post('/upload/profile', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No photo uploaded' });
    }

    const { description } = req.body;
    const imageBuffer = fs.readFileSync(req.file.path);
    const metadata = await sharp(imageBuffer).metadata();

    const photo = new Photo({
      url: `/uploads/${req.file.filename}`,
      uploadedBy: req.userId,
      profilePhoto: true,
      description,
      fileSize: req.file.size,
      dimensions: {
        width: metadata.width,
        height: metadata.height
      }
    });

    await photo.save();
    res.status(201).json({ message: 'Photo uploaded', photo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/upload/folder/:folderId', auth, upload.single('photo'), async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.folderId);

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    if (!folder.members.includes(req.userId)) {
      return res.status(403).json({ message: 'Not a member of this folder' });
    }

    if (folder.photos.length >= folder.maxPhotos) {
      return res.status(400).json({ message: 'Folder photo limit reached (20 photos)' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No photo uploaded' });
    }

    const { description } = req.body;
    const imageBuffer = fs.readFileSync(req.file.path);
    const metadata = await sharp(imageBuffer).metadata();

    const photo = new Photo({
      url: `/uploads/${req.file.filename}`,
      uploadedBy: req.userId,
      folder: req.params.folderId,
      description,
      fileSize: req.file.size,
      dimensions: {
        width: metadata.width,
        height: metadata.height
      }
    });

    await photo.save();
    folder.photos.push(photo._id);
    await folder.save();

    res.status(201).json({ message: 'Photo uploaded to folder', photo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/folder/:folderId', async (req, res) => {
  try {
    const photos = await Photo.find({ folder: req.params.folderId })
      .populate('uploadedBy')
      .sort({ createdAt: -1 });
    
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/like/:photoId', auth, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.photoId);

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    if (photo.likes.includes(req.userId)) {
      photo.likes = photo.likes.filter(id => id.toString() !== req.userId);
    } else {
      photo.likes.push(req.userId);
    }

    await photo.save();
    res.json({ message: 'Photo updated', photo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/comment/:photoId', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const photo = await Photo.findById(req.params.photoId);

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    photo.comments.push({
      user: req.userId,
      text
    });

    await photo.save();
    res.json({ message: 'Comment added', photo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
