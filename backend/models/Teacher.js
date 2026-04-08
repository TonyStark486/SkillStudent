const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add name'],
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
  department: {
    type: String,
    required: [true, 'Please add department'],
    enum: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical']
  },
  designation: {
    type: String,
    required: [true, 'Please add designation'],
    enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Senior Lecturer', 'Lecturer', 'HOD']
  },
  employeeId: {
    type: String,
    required: [true, 'Please add employee ID'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please add password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    default: 'teacher'
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: []  // ← ADD THIS DEFAULT VALUE
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password
teacherSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
teacherSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Teacher', teacherSchema);