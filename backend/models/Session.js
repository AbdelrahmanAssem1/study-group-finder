const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [60, 'Subject cannot exceed 60 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Session date is required'],
    },
    sessionType: {
      type: String,
      enum: ['online', 'offline'],
      required: [true, 'Session type is required'],
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    meetingLink: {
      type: String,
      trim: true,
      default: '',
    },
    maxParticipants: {
      type: Number,
      default: 20,
      min: [2, 'Min 2 participants'],
      max: [100, 'Max 100 participants'],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: participant count
sessionSchema.virtual('participantCount').get(function () {
  return this.participants.length;
});

// Virtual: is full
sessionSchema.virtual('isFull').get(function () {
  return this.participants.length >= this.maxParticipants;
});

// Index for fast filtering by subject
sessionSchema.index({ subject: 1, date: 1 });

module.exports = mongoose.model('Session', sessionSchema);
