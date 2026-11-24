import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import Course from '../models/Course.js';

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private
export const getAllTeachers = async (req, res, next) => {
  try {
    const { search, department, status } = req.query;
    const query = {};

    if (department && department !== 'all') {
      query.department = department;
    }
    if (status && status !== 'all') {
      query.status = status;
    }

    let teachers = await Teacher.find(query)
      .populate('user', 'name email avatar phone bio isActive createdAt')
      .populate('assignedCourses', 'title code category enrolledCount thumbnail')
      .sort({ createdAt: -1 });

    if (search) {
      const term = search.toLowerCase();
      teachers = teachers.filter(
        (t) =>
          (t.teacherId && t.teacherId.toLowerCase().includes(term)) ||
          (t.user && t.user.name && t.user.name.toLowerCase().includes(term)) ||
          (t.user && t.user.email && t.user.email.toLowerCase().includes(term)) ||
          (t.department && t.department.toLowerCase().includes(term)) ||
          (t.specialization && t.specialization.toLowerCase().includes(term))
      );
    }

    res.status(200).json({
      success: true,
      count: teachers.length,
      teachers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single teacher details
// @route   GET /api/teachers/:id
// @access  Private
export const getTeacherById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('user', 'name email avatar phone address bio isActive createdAt')
      .populate('assignedCourses');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher record not found' });
    }

    res.status(200).json({
      success: true,
      teacher
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create teacher
// @route   POST /api/teachers
// @access  Private (Admin)
export const createTeacher = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password = 'password123',
      phone,
      department = 'Computer Science',
      qualification = "Master's Degree",
      specialization = 'Software Engineering',
      status = 'active',
      bio
    } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'teacher',
      phone: phone || '',
      bio: bio || ''
    });

    const teacherCount = await Teacher.countDocuments();
    const teacherId = `TCH-${new Date().getFullYear()}-${String(teacherCount + 1).padStart(3, '0')}`;

    const teacher = await Teacher.create({
      user: user._id,
      teacherId,
      department,
      qualification,
      specialization,
      status
    });

    const populatedTeacher = await Teacher.findById(teacher._id)
      .populate('user', '-password')
      .populate('assignedCourses');

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      teacher: populatedTeacher
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private (Admin)
export const updateTeacher = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      department,
      qualification,
      specialization,
      status,
      bio,
      isActive
    } = req.body;

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher record not found' });
    }

    if (department) teacher.department = department;
    if (qualification) teacher.qualification = qualification;
    if (specialization) teacher.specialization = specialization;
    if (status) teacher.status = status;
    await teacher.save();

    const user = await User.findById(teacher.user);
    if (user) {
      if (name) user.name = name;
      if (email) user.email = email.toLowerCase();
      if (phone !== undefined) user.phone = phone;
      if (bio !== undefined) user.bio = bio;
      if (isActive !== undefined) user.isActive = isActive;
      await user.save();
    }

    const updated = await Teacher.findById(teacher._id)
      .populate('user', '-password')
      .populate('assignedCourses');

    res.status(200).json({
      success: true,
      message: 'Teacher updated successfully',
      teacher: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign courses to teacher
// @route   PUT /api/teachers/:id/courses
// @access  Private (Admin)
export const assignCourses = async (req, res, next) => {
  try {
    const { courseIds } = req.body; // array of course IDs
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    teacher.assignedCourses = courseIds || [];
    await teacher.save();

    // Update teacher ref in Course documents
    if (courseIds && courseIds.length > 0) {
      await Course.updateMany(
        { _id: { $in: courseIds } },
        { teacher: teacher.user }
      );
    }

    const updated = await Teacher.findById(teacher._id)
      .populate('user', '-password')
      .populate('assignedCourses');

    res.status(200).json({
      success: true,
      message: 'Courses assigned successfully',
      teacher: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Admin)
export const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    await User.findByIdAndDelete(teacher.user);
    await Teacher.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
