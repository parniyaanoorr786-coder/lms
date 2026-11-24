import Attendance from '../models/Attendance.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

// @desc    Mark or update attendance for a course on a specific date
// @route   POST /api/attendance
// @access  Private (Admin, Teacher)
export const markAttendance = async (req, res, next) => {
  try {
    const { courseId, date, records } = req.body;
    // records: [ { student: studentId, status: 'present'|'absent'|'late'|'excused', remarks: '' } ]

    if (!courseId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide courseId, date, and student attendance records'
      });
    }

    // Normalize date to start of day (midnight) to prevent multiple records for same day
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
      course: courseId,
      date: attendanceDate
    });

    if (attendance) {
      attendance.records = records;
      attendance.markedBy = req.user._id;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        course: courseId,
        date: attendanceDate,
        markedBy: req.user._id,
        records
      });
    }

    const populated = await Attendance.findById(attendance._id)
      .populate('records.student', 'name email avatar')
      .populate('course', 'title code');

    res.status(200).json({
      success: true,
      message: 'Attendance recorded successfully',
      attendance: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance for a course by date
// @route   GET /api/attendance/course/:courseId
// @access  Private
export const getAttendanceByCourseAndDate = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { date } = req.query;

    const query = { course: courseId };
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      query.date = targetDate;
    }

    const attendanceRecords = await Attendance.find(query)
      .populate('records.student', 'name email avatar')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      attendance: attendanceRecords
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance summary report for a course
// @route   GET /api/attendance/course/:courseId/report
// @access  Private (Admin, Teacher)
export const getCourseAttendanceReport = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const enrollments = await Enrollment.find({ course: courseId, status: { $ne: 'dropped' } })
      .populate('student', 'name email avatar');

    const attendances = await Attendance.find({ course: courseId });
    const totalSessions = attendances.length;

    const report = enrollments.map((enr) => {
      const studentId = enr.student._id.toString();
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let excusedCount = 0;

      attendances.forEach((att) => {
        const rec = att.records.find((r) => r.student && r.student.toString() === studentId);
        if (rec) {
          if (rec.status === 'present') presentCount++;
          else if (rec.status === 'absent') absentCount++;
          else if (rec.status === 'late') lateCount++;
          else if (rec.status === 'excused') excusedCount++;
        }
      });

      const attendancePercentage = totalSessions > 0
        ? Math.round(((presentCount + lateCount * 0.5) / totalSessions) * 100)
        : 100;

      return {
        student: enr.student,
        totalSessions,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        attendancePercentage
      };
    });

    res.status(200).json({
      success: true,
      totalSessions,
      report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's individual attendance report
// @route   GET /api/attendance/student/:studentId
// @access  Private
export const getStudentAttendanceReport = async (req, res, next) => {
  try {
    const targetStudentId = req.user.role === 'student' ? req.user._id : req.params.studentId;

    const enrollments = await Enrollment.find({ student: targetStudentId, status: { $ne: 'dropped' } })
      .populate('course', 'title code thumbnail');

    const courseIds = enrollments.map((e) => e.course._id);
    const attendances = await Attendance.find({ course: { $in: courseIds } })
      .populate('course', 'title code')
      .sort({ date: -1 });

    const courseStats = {};
    enrollments.forEach((e) => {
      courseStats[e.course._id.toString()] = {
        course: e.course,
        totalSessions: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        history: []
      };
    });

    attendances.forEach((att) => {
      const cId = att.course._id.toString();
      if (courseStats[cId]) {
        courseStats[cId].totalSessions += 1;
        const rec = att.records.find((r) => r.student && r.student.toString() === targetStudentId.toString());
        if (rec) {
          if (rec.status === 'present') courseStats[cId].present += 1;
          else if (rec.status === 'absent') courseStats[cId].absent += 1;
          else if (rec.status === 'late') courseStats[cId].late += 1;
          else if (rec.status === 'excused') courseStats[cId].excused += 1;

          courseStats[cId].history.push({
            date: att.date,
            status: rec.status,
            remarks: rec.remarks
          });
        }
      }
    });

    const coursesArray = Object.values(courseStats).map((stat) => ({
      ...stat,
      percentage: stat.totalSessions > 0
        ? Math.round(((stat.present + stat.late * 0.5) / stat.totalSessions) * 100)
        : 100
    }));

    res.status(200).json({
      success: true,
      courses: coursesArray
    });
  } catch (error) {
    next(error);
  }
};
