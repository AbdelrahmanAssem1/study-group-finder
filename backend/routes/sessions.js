const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Session = require('../models/Session');
const { protect } = require('../middleware/auth');

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  return null;
};

// @route  GET /api/sessions
// @desc   Get all sessions (with optional subject filter & search)
// @access Public
router.get('/', async (req, res, next) => {
  try {
    const { subject, search, type, status, page = 1, limit = 12 } = req.query;
    const filter = {};

    if (subject && subject !== 'all') filter.subject = { $regex: subject, $options: 'i' };
    if (type && type !== 'all') filter.sessionType = type;
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Session.countDocuments(filter);
    const sessions = await Session.find(filter)
      .populate('creator', 'name email major')
      .populate('participants', 'name email')
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: sessions.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      sessions,
    });
  } catch (error) {
    next(error);
  }
});

// @route  GET /api/sessions/my
// @desc   Get sessions created by or joined by current user
// @access Private
router.get('/my', protect, async (req, res, next) => {
  try {
    const created = await Session.find({ creator: req.user._id })
      .populate('creator', 'name email')
      .populate('participants', 'name email')
      .sort({ date: 1 });

    const joined = await Session.find({
      participants: req.user._id,
      creator: { $ne: req.user._id },
    })
      .populate('creator', 'name email')
      .populate('participants', 'name email')
      .sort({ date: 1 });

    res.json({ success: true, created, joined });
  } catch (error) {
    next(error);
  }
});

// @route  GET /api/sessions/subjects
// @desc   Get distinct subjects for filtering
// @access Public
router.get('/subjects', async (req, res, next) => {
  try {
    const subjects = await Session.distinct('subject');
    res.json({ success: true, subjects });
  } catch (error) {
    next(error);
  }
});

// @route  GET /api/sessions/:id
// @desc   Get single session by ID
// @access Public
router.get('/:id', async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('creator', 'name email major')
      .populate('participants', 'name email major');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
});

// @route  POST /api/sessions
// @desc   Create a new study session
// @access Private
router.post(
  '/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }).withMessage('Title too long'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 500 }).withMessage('Description too long'),
    body('date').isISO8601().withMessage('Valid date is required').custom((val) => {
      if (new Date(val) < new Date()) throw new Error('Session date must be in the future');
      return true;
    }),
    body('sessionType').isIn(['online', 'offline']).withMessage('Type must be online or offline'),
    body('maxParticipants').optional().isInt({ min: 2, max: 100 }).withMessage('Max participants must be between 2 and 100'),
  ],
  async (req, res, next) => {
    const validationError = validate(req, res);
    if (validationError) return;

    try {
      const session = await Session.create({
        ...req.body,
        creator: req.user._id,
        participants: [req.user._id],
      });

      const populated = await session.populate([
        { path: 'creator', select: 'name email' },
        { path: 'participants', select: 'name email' },
      ]);

      res.status(201).json({ success: true, message: 'Session created successfully', session: populated });
    } catch (error) {
      next(error);
    }
  }
);

// @route  PUT /api/sessions/:id
// @desc   Update a session (creator only)
// @access Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    if (session.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the creator can update this session' });
    }

    const updatedSession = await Session.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    )
      .populate('creator', 'name email')
      .populate('participants', 'name email');

    res.json({ success: true, message: 'Session updated', session: updatedSession });
  } catch (error) {
    next(error);
  }
});

// @route  DELETE /api/sessions/:id
// @desc   Delete a session (creator only)
// @access Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    if (session.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the creator can delete this session' });
    }

    await session.deleteOne();
    res.json({ success: true, message: 'Session deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// @route  POST /api/sessions/:id/join
// @desc   Join a session
// @access Private
router.post('/:id/join', protect, async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    if (session.participants.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You have already joined this session' });
    }

    if (session.participants.length >= session.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Session is full' });
    }

    if (session.status !== 'upcoming') {
      return res.status(400).json({ success: false, message: 'Cannot join a session that is not upcoming' });
    }

    session.participants.push(req.user._id);
    await session.save();

    const updated = await Session.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('participants', 'name email');

    res.json({ success: true, message: 'Joined session successfully', session: updated });
  } catch (error) {
    next(error);
  }
});

// @route  DELETE /api/sessions/:id/leave
// @desc   Leave a session
// @access Private
router.delete('/:id/leave', protect, async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    if (session.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Creator cannot leave their own session. Delete it instead.' });
    }

    if (!session.participants.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You are not part of this session' });
    }

    session.participants = session.participants.filter(
      (p) => p.toString() !== req.user._id.toString()
    );
    await session.save();

    res.json({ success: true, message: 'Left session successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
