const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  tech: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    default: ''
  },
  githubLink: {
    type: String,
    default: ''
  },
  liveDemo: {
    type: String,
    default: ''
  }
});

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    default: ''
  },
  certificate: {
    type: String,
    default: ''
  }
});

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add student name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  rollNumber: {
    type: String,
    required: [true, 'Please add roll number'],
    unique: true,
    trim: true
  },
  branch: {
    type: String,
    required: [true, 'Please add branch'],
    enum: ['CSE', 'IT', 'ECE', 'MECH', 'CIVIL', 'EEE', 'OTHER']
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
    default: 1
  },
  skills: [{
    type: String,
    trim: true
  }],
  projects: [projectSchema],
  achievements: [achievementSchema],
  cgpa: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  attendance: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

studentSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Student', studentSchema);