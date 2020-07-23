const express = require('express');
const router = express.Router();
const _ = require('lodash');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route  GET api/profile/me
// @desc   Get current user's profile
// @access Private
router.get('/me', auth, async (req, res) => {
  const user = _.get(req, ['user', 'id']);
  try {
    const profile = await Profile.findOne({
      user,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server internal error');
  }
});

// @route  POST api/profile
// @desc   Create or update a user profile
// @access Private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = _.get(req, ['user', 'id']);

    // Build profile object
    const profileFields = {};
    profileFields.user = user;
    profileFields.social = {};

    const allFields = [
      'company',
      'website',
      'location',
      'bio',
      'status',
      'githubusername',
      'skills',
      'youtube',
      'facebook',
      'twitter',
      'instagram',
      'linkedin',
    ];

    const fields = req.body;
    Object.keys(fields).map((field) => {
      if (allFields.includes(field)) {
        switch (field) {
          case 'skills':
            profileFields.skills = _.get(fields, 'skills', '')
              .split(',')
              .map((skill) => skill.trim());
            break;
          case 'youtube':
          case 'twitter':
          case 'facebook':
          case 'linkedin':
          case 'instagram':
            profileFields['social'][field] = _.get(fields, field);
            break;
          default:
            profileFields[field] = _.get(fields, field);
            break;
        }
      }
    });

    try {
      let profile = await Profile.findOne({ user });
      if (profile) {
        // update
        profile = await Profile.findOneAndUpdate(
          { user },
          { $set: profileFields },
          { new: true },
        );

        return res.json(profile);
      }

      // create
      profile = new Profile(profileFields);
      await profile.save();
      return res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server internal error');
    }
  },
);

// @route  GET api/profile
// @desc   Get all profiles
// @access Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server internal error');
  }
});

// @route  GET api/profile/user/:userId
// @desc   Get profile by user ID
// @access Public
router.get('/user/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.userId,
    }).populate('user', ['name', 'avatar']);

    if (!profile) return res.status(400).json({ msg: 'Profile not found' });

    return res.json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    return res.status(500).send('Server internal error');
  }
});

module.exports = router;
