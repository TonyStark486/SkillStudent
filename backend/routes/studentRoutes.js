const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Student = require('../models/Student');

// @route   POST /api/students/add
// @desc    Add new student
router.post('/add', protect, async (req, res) => {
  try {
    const { name, email, rollNumber, branch, semester, skills, projects, achievements, cgpa, attendance } = req.body;
    
    const existingStudent = await Student.findOne({ $or: [{ email }, { rollNumber }] });
    if (existingStudent) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student with this email or roll number already exists' 
      });
    }
    
    const student = await Student.create({
      name,
      email,
      rollNumber,
      branch,
      semester: semester || 1,
      skills: skills || [],
      projects: projects || [],
      achievements: achievements || [],
      cgpa: cgpa || 0,
      attendance: attendance || 0,
      addedBy: req.teacher._id
    });
    
    await req.teacher.students.push(student._id);
    await req.teacher.save();
    
    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      student
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/students
// @desc    Get all students for logged in teacher
router.get('/', protect, async (req, res) => {
  try {
    const { branch, semester, skill } = req.query;
    let query = { addedBy: req.teacher._id };
    
    if (branch) query.branch = branch;
    if (semester) query.semester = semester;
    if (skill) query.skills = { $in: [skill] };
    
    const students = await Student.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/students/:id
// @desc    Get single student by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findOne({ 
      _id: req.params.id, 
      addedBy: req.teacher._id 
    });
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    res.status(200).json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/students/:id
// @desc    Update student details
router.put('/:id', protect, async (req, res) => {
  try {
    let student = await Student.findOne({ 
      _id: req.params.id, 
      addedBy: req.teacher._id 
    });
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const { name, email, rollNumber, branch, semester, skills, projects, achievements, cgpa, attendance } = req.body;
    
    if (name) student.name = name;
    if (email) student.email = email;
    if (rollNumber) student.rollNumber = rollNumber;
    if (branch) student.branch = branch;
    if (semester) student.semester = semester;
    if (skills) student.skills = skills;
    if (projects) student.projects = projects;
    if (achievements) student.achievements = achievements;
    if (cgpa !== undefined) student.cgpa = cgpa;
    if (attendance !== undefined) student.attendance = attendance;
    
    student.updatedAt = Date.now();
    await student.save();
    
    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      student
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student
router.delete('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ 
      _id: req.params.id, 
      addedBy: req.teacher._id 
    });
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    await req.teacher.students.pull(student._id);
    await req.teacher.save();
    
    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/students/:id/skills
// @desc    Add skill to student
router.post('/:id/skills', protect, async (req, res) => {
  try {
    const { skill } = req.body;
    
    if (!skill) {
      return res.status(400).json({ success: false, message: 'Skill is required' });
    }
    
    const student = await Student.findOne({ 
      _id: req.params.id, 
      addedBy: req.teacher._id 
    });
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    if (student.skills.includes(skill)) {
      return res.status(400).json({ success: false, message: 'Skill already exists' });
    }
    
    student.skills.push(skill);
    student.updatedAt = Date.now();
    await student.save();
    
    res.status(200).json({
      success: true,
      message: 'Skill added successfully',
      student
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/students/:id/skills/:skill
// @desc    Remove skill from student
router.delete('/:id/skills/:skill', protect, async (req, res) => {
  try {
    const student = await Student.findOne({ 
      _id: req.params.id, 
      addedBy: req.teacher._id 
    });
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    student.skills = student.skills.filter(s => s !== req.params.skill);
    student.updatedAt = Date.now();
    await student.save();
    
    res.status(200).json({
      success: true,
      message: 'Skill removed successfully',
      student
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/students/search/:skill
// @desc    Search students by skill
router.get('/search/:skill', protect, async (req, res) => {
  try {
    const skill = req.params.skill;
    const students = await Student.find({ 
      addedBy: req.teacher._id,
      skills: { $regex: skill, $options: 'i' }
    });
    
    res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/students/stats/summary
// @desc    Get statistics for teacher dashboard
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const students = await Student.find({ addedBy: req.teacher._id });
    
    let totalSkills = 0;
    let totalProjects = 0;
    let totalAchievements = 0;
    
    students.forEach(s => {
      totalSkills += s.skills?.length || 0;
      totalProjects += s.projects?.length || 0;
      totalAchievements += s.achievements?.length || 0;
    });
    
    res.status(200).json({
      success: true,
      stats: {
        totalStudents: students.length,
        totalSkills,
        totalProjects,
        totalAchievements
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;