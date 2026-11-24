import User from '../models/User.js';
import Student from '../models/Student.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Get all students with search, filter, pagination
// @route   GET /api/students
// @access  Private (Admin, Teacher)
export const getAllStudents = async (req, res, next) => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (department && department !== 'all') {
      query.department = department;
    }
    if (status && status !== 'all') {
      query.status = status;
    }

    let students = await Student.find(query)
      .populate('user', 'name email avatar phone address isActive createdAt')
      .sort({ createdAt: -1 });

    // Filter by search term on user name, email, or studentId
    if (search) {
      const term = search.toLowerCase();
      students = students.filter(
        (s) =>
          (s.studentId && s.studentId.toLowerCase().includes(term)) ||
          (s.user && s.user.name && s.user.name.toLowerCase().includes(term)) ||
          (s.user && s.user.email && s.user.email.toLowerCase().includes(term)) ||
          (s.department && s.department.toLowerCase().includes(term))
      );
    }

    const total = students.length;
    const startIndex = (page - 1) * limit;
    const paginatedStudents = students.slice(startIndex, startIndex + Number(limit));

    res.status(200).json({
      success: true,
      count: paginatedStudents.length,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: Number(page),
      students: paginatedStudents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student details with enrolled courses
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      'user',
      'name email avatar phone address bio isActive createdAt'
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    const enrollments = await Enrollment.find({ student: student.user._id })
      .populate('course', 'title code thumbnail category duration level')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      student,
      enrollments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new student (User + Student)
// @route   POST /api/students
// @access  Private (Admin)
export const createStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password = 'password123',
      phone,
      address,
      department = 'Computer Science',
      gradeLevel = 'Undergraduate',
      guardianName,
      guardianPhone,
      dateOfBirth,
      status = 'active'
    } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'student',
      phone: phone || '',
      address: address || ''
    });

    const studentCount = await Student.countDocuments();
    const studentId = `STU-${new Date().getFullYear()}-${String(studentCount + 1).padStart(4, '0')}`;

    const student = await Student.create({
      user: user._id,
      studentId,
      department,
      gradeLevel,
      guardianName: guardianName || '',
      guardianPhone: guardianPhone || '',
      dateOfBirth: dateOfBirth || null,
      status
    });

    const populatedStudent = await Student.findById(student._id).populate('user', '-password');

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student: populatedStudent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private (Admin)
export const updateStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      department,
      gradeLevel,
      guardianName,
      guardianPhone,
      status,
      isActive
    } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    // Update Student model
    if (department) student.department = department;
    if (gradeLevel) student.gradeLevel = gradeLevel;
    if (guardianName !== undefined) student.guardianName = guardianName;
    if (guardianPhone !== undefined) student.guardianPhone = guardianPhone;
    if (status) student.status = status;
    await student.save();

    // Update User model
    const user = await User.findById(student.user);
    if (user) {
      if (name) user.name = name;
      if (email) user.email = email.toLowerCase();
      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;
      if (isActive !== undefined) user.isActive = isActive;
      await user.save();
    }

    const updated = await Student.findById(student._id).populate('user', '-password');

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      student: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await User.findByIdAndDelete(student.user);
    await Enrollment.deleteMany({ student: student.user });
    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Student and related records deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student statistics
// @route   GET /api/students/stats
// @access  Private (Admin, Teacher)
export const getStudentStats = async (req, res, next) => {
  try {
    const total = await Student.countDocuments();
    const active = await Student.countDocuments({ status: 'active' });
    const graduated = await Student.countDocuments({ status: 'graduated' });
    const inactive = await Student.countDocuments({ status: 'inactive' });

    const departments = await Student.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        active,
        graduated,
        inactive,
        departments
      }
    });
  } catch (error) {
    next(error);
  }
};
