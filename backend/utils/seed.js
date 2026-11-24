import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Lesson from '../models/Lesson.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Quiz from '../models/Quiz.js';
import Result from '../models/Result.js';
import Attendance from '../models/Attendance.js';
import Notification from '../models/Notification.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lms_database';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB database...');

    // Clear existing collections
    await User.deleteMany();
    await Student.deleteMany();
    await Teacher.deleteMany();
    await Course.deleteMany();
    await Enrollment.deleteMany();
    await Lesson.deleteMany();
    await Assignment.deleteMany();
    await Submission.deleteMany();
    await Quiz.deleteMany();
    await Result.deleteMany();
    await Attendance.deleteMany();
    await Notification.deleteMany();

    console.log('[Seed] Cleared existing records.');

    // 1. Create Admin User
    const adminUser = await User.create({
      name: 'PARNIYA NOOR',
      email: 'admin@lms.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 (555) 019-2831',
      address: '100 University Avenue, Boston, MA',
      bio: 'Head LMS Platform Administrator overseeing academic operations and course enrollments.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
    });

    // 2. Create Teachers
    const teacherUsers = await User.create([
      {
        name: 'Dr. Sarah Jenkins',
        email: 'sarah.jenkins@lms.com',
        password: 'teacher123',
        role: 'teacher',
        phone: '+1 (555) 234-5678',
        address: '42 Tech Lane, Cambridge, MA',
        bio: 'Senior Full Stack Web Developer & Computer Science Lecturer with 12+ years experience.',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'
      },
      {
        name: 'Prof. David Miller',
        email: 'david.miller@lms.com',
        password: 'teacher123',
        role: 'teacher',
        phone: '+1 (555) 345-6789',
        address: '77 Silicon Way, Austin, TX',
        bio: 'Data Science Researcher specializing in Neural Networks, Deep Learning and Python analytics.',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'
      },
      {
        name: 'Elena Rostova',
        email: 'elena.rostova@lms.com',
        password: 'teacher123',
        role: 'teacher',
        phone: '+1 (555) 456-7890',
        address: '88 Creative Blvd, San Francisco, CA',
        bio: 'Product Designer, UX Architect & Design Systems Lead at leading tech studios.',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400'
      }
    ]);

    const teacherDocs = await Teacher.create([
      {
        user: teacherUsers[0]._id,
        teacherId: 'TCH-2026-001',
        department: 'Software Engineering',
        qualification: 'Ph.D. in Computer Science',
        specialization: 'Full Stack Web Architecture & React/Node.js Ecosystems'
      },
      {
        user: teacherUsers[1]._id,
        teacherId: 'TCH-2026-002',
        department: 'Artificial Intelligence',
        qualification: 'M.Sc. in Data Science & Machine Learning',
        specialization: 'Python, Predictive Analytics & Deep Learning Models'
      },
      {
        user: teacherUsers[2]._id,
        teacherId: 'TCH-2026-003',
        department: 'Digital Design',
        qualification: 'Master of Fine Arts (Interaction Design)',
        specialization: 'UI/UX Design, Design Thinking & Figma Systems'
      }
    ]);

    // 3. Create Students
    const studentUsers = await User.create([
      {
        name: 'Alex Turner',
        email: 'alex.turner@lms.com',
        password: 'student123',
        role: 'student',
        phone: '+1 (555) 678-1122',
        address: '12 Maple St, Seattle, WA',
        bio: 'Passionate developer aspiring to become a senior full-stack engineer.',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400'
      },
      {
        name: 'Maya Lin',
        email: 'maya.lin@lms.com',
        password: 'student123',
        role: 'student',
        phone: '+1 (555) 789-2233',
        address: '34 Oak Ave, San Jose, CA',
        bio: 'Data Enthusiast focusing on AI, Python and predictive analytics.',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400'
      },
      {
        name: 'Liam Smith',
        email: 'liam.smith@lms.com',
        password: 'student123',
        role: 'student',
        phone: '+1 (555) 890-3344',
        address: '56 Elm St, Chicago, IL',
        bio: 'Aspiring digital designer passionate about sleek micro-interactions.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
      },
      {
        name: 'Sophia Chen',
        email: 'sophia.chen@lms.com',
        password: 'student123',
        role: 'student',
        phone: '+1 (555) 901-4455',
        address: '78 Pine Rd, Denver, CO',
        bio: 'Engineering student building scalable modern web and cloud applications.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400'
      },
      {
        name: 'Noah Patel',
        email: 'noah.patel@lms.com',
        password: 'student123',
        role: 'student',
        phone: '+1 (555) 012-5566',
        address: '90 Cedar Ct, New York, NY',
        bio: 'Computer Science sophomore diving deep into full-stack and cloud dev.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'
      }
    ]);

    await Student.create([
      {
        user: studentUsers[0]._id,
        studentId: 'STU-2026-0001',
        department: 'Computer Science',
        gradeLevel: 'Junior (Year 3)',
        guardianName: 'Robert Turner',
        guardianPhone: '+1 (555) 111-2222',
        status: 'active'
      },
      {
        user: studentUsers[1]._id,
        studentId: 'STU-2026-0002',
        department: 'Artificial Intelligence',
        gradeLevel: 'Senior (Year 4)',
        guardianName: 'Li Lin',
        guardianPhone: '+1 (555) 222-3333',
        status: 'active'
      },
      {
        user: studentUsers[2]._id,
        studentId: 'STU-2026-0003',
        department: 'Digital Design',
        gradeLevel: 'Sophomore (Year 2)',
        guardianName: 'Emily Smith',
        guardianPhone: '+1 (555) 333-4444',
        status: 'active'
      },
      {
        user: studentUsers[3]._id,
        studentId: 'STU-2026-0004',
        department: 'Computer Science',
        gradeLevel: 'Junior (Year 3)',
        guardianName: 'Wei Chen',
        guardianPhone: '+1 (555) 444-5555',
        status: 'active'
      },
      {
        user: studentUsers[4]._id,
        studentId: 'STU-2026-0005',
        department: 'Computer Science',
        gradeLevel: 'Sophomore (Year 2)',
        guardianName: 'Raj Patel',
        guardianPhone: '+1 (555) 555-6666',
        status: 'active'
      }
    ]);

    // 4. Create Courses
    const courses = await Course.create([
      {
        title: 'Full Stack Web Development with React & Node.js',
        code: 'CS-101',
        description: 'Master modern frontend and backend development with React, Vite, Tailwind CSS, Node.js, Express, and MongoDB. Build production-ready web applications from scratch.',
        category: 'Web Development',
        level: 'Intermediate',
        duration: '10 Weeks',
        price: 199,
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800',
        teacher: teacherUsers[0]._id,
        status: 'published',
        enrolledCount: 4
      },
      {
        title: 'Data Science & Machine Learning Masterclass',
        code: 'DS-201',
        description: 'Comprehensive pathway to data science with Python, Pandas, NumPy, Scikit-learn, statistical data analysis, and predictive modeling algorithms.',
        category: 'Data Science',
        level: 'Advanced',
        duration: '12 Weeks',
        price: 249,
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
        teacher: teacherUsers[1]._id,
        status: 'published',
        enrolledCount: 3
      },
      {
        title: 'UI/UX Design Systems & Figma Interactive Prototyping',
        code: 'DSN-105',
        description: 'Learn user experience research, wireframing, color theory, typography, design tokens, and build scalable interactive design systems in Figma.',
        category: 'Design',
        level: 'Beginner',
        duration: '6 Weeks',
        price: 149,
        thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=800',
        teacher: teacherUsers[2]._id,
        status: 'published',
        enrolledCount: 3
      },
      {
        title: 'Cloud Architecture & DevOps CI/CD Pipelines',
        code: 'CLD-301',
        description: 'Deploy resilient cloud infrastructure with Docker, Kubernetes, AWS microservices, automated testing, and GitHub Actions pipelines.',
        category: 'Cloud Computing',
        level: 'Advanced',
        duration: '8 Weeks',
        price: 229,
        thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
        teacher: teacherUsers[0]._id,
        status: 'published',
        enrolledCount: 2
      },
      {
        title: 'Cybersecurity Fundamentals & Network Defense',
        code: 'SEC-401',
        description: 'Understand vulnerability assessment, secure socket layer protocols, defensive countermeasures, penetration testing basics, and threat mitigation.',
        category: 'Cybersecurity',
        level: 'Intermediate',
        duration: '8 Weeks',
        price: 189,
        thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
        teacher: teacherUsers[1]._id,
        status: 'published',
        enrolledCount: 2
      }
    ]);

    // Update teacher assigned courses
    await Teacher.findByIdAndUpdate(teacherDocs[0]._id, {
      assignedCourses: [courses[0]._id, courses[3]._id]
    });
    await Teacher.findByIdAndUpdate(teacherDocs[1]._id, {
      assignedCourses: [courses[1]._id, courses[4]._id]
    });
    await Teacher.findByIdAndUpdate(teacherDocs[2]._id, {
      assignedCourses: [courses[2]._id]
    });

    // 5. Create Lessons for Course 1 (Web Development)
    const lessonsCourse1 = await Lesson.create([
      {
        course: courses[0]._id,
        title: 'Introduction to Modern Full Stack Architecture',
        description: 'Explore the client-server model, REST APIs, JSON data flow, and modern web application architectural patterns.',
        order: 1,
        duration: '35 mins',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        isFreePreview: true,
        studyMaterials: [
          { title: 'Fullstack Overview Lecture Slides.pdf', fileUrl: 'https://example.com/slides1.pdf', fileType: 'pdf' },
          { title: 'REST API Best Practices Cheatsheet.pdf', fileUrl: 'https://example.com/rest-sheet.pdf', fileType: 'pdf' }
        ]
      },
      {
        course: courses[0]._id,
        title: 'React Components, Props & Hooks Deep Dive',
        description: 'Deep dive into functional components, useState, useEffect, custom hooks, and state management strategies.',
        order: 2,
        duration: '45 mins',
        videoUrl: 'https://www.youtube.com/embed/bMknfKXIFA8',
        isFreePreview: true,
        studyMaterials: [
          { title: 'React 18 Hooks Reference Manual.pdf', fileUrl: 'https://example.com/react-hooks.pdf', fileType: 'pdf' }
        ]
      },
      {
        course: courses[0]._id,
        title: 'Tailwind CSS for Production SaaS Interfaces',
        description: 'Building responsive, accessible, and high-performance UI components with Tailwind CSS utility classes.',
        order: 3,
        duration: '40 mins',
        videoUrl: 'https://www.youtube.com/embed/ft30zcMlFao',
        isFreePreview: false,
        studyMaterials: [
          { title: 'Tailwind Design System Tokens.pdf', fileUrl: 'https://example.com/tailwind.pdf', fileType: 'pdf' }
        ]
      },
      {
        course: courses[0]._id,
        title: 'Node.js & Express.js RESTful API Engineering',
        description: 'Creating scalable Express routers, error handling middleware, request validation, and clean controller patterns.',
        order: 4,
        duration: '50 mins',
        videoUrl: 'https://www.youtube.com/embed/Oe421EPjeBE',
        isFreePreview: false,
        studyMaterials: [
          { title: 'Express Middleware Guide.pdf', fileUrl: 'https://example.com/express.pdf', fileType: 'pdf' }
        ]
      },
      {
        course: courses[0]._id,
        title: 'MongoDB & Mongoose Schema Design & Optimization',
        description: 'Data modeling, indexes, relationships, population, aggregation pipelines, and secure database connections.',
        order: 5,
        duration: '55 mins',
        videoUrl: 'https://www.youtube.com/embed/ofme2o29ngU',
        isFreePreview: false,
        studyMaterials: [
          { title: 'MongoDB Aggregations Cheatsheet.pdf', fileUrl: 'https://example.com/mongo.pdf', fileType: 'pdf' }
        ]
      }
    ]);

    // Lessons for Course 2 (Data Science)
    await Lesson.create([
      {
        course: courses[1]._id,
        title: 'Python for Data Analysis: NumPy & Pandas Foundations',
        description: 'Vectorized computing, series, data frames, cleaning missing data, and filtering large tabular datasets.',
        order: 1,
        duration: '45 mins',
        videoUrl: 'https://www.youtube.com/embed/vmEHCJofslg',
        isFreePreview: true,
        studyMaterials: [
          { title: 'Pandas Quickstart Guide.pdf', fileUrl: 'https://example.com/pandas.pdf', fileType: 'pdf' }
        ]
      },
      {
        course: courses[1]._id,
        title: 'Exploratory Data Analysis & Matplotlib / Seaborn',
        description: 'Data distributions, correlation matrices, box plots, histograms, and visual storytelling with statistics.',
        order: 2,
        duration: '40 mins',
        videoUrl: 'https://www.youtube.com/embed/GPVsHOlRBBI',
        isFreePreview: false,
        studyMaterials: []
      }
    ]);

    // 6. Create Assignments
    const assignment1 = await Assignment.create({
      course: courses[0]._id,
      title: 'Build a Responsive Product Card & Catalog in React',
      description: 'Create a reusable Product Card component utilizing React props and styled with Tailwind CSS. Implement filter buttons by category and a live search input.',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      maxScore: 100,
      createdBy: teacherUsers[0]._id,
      attachments: [
        { title: 'Project Specification Document.pdf', fileUrl: 'https://example.com/spec1.pdf' }
      ]
    });

    const assignment2 = await Assignment.create({
      course: courses[0]._id,
      title: 'Design and Implement User Authentication REST API',
      description: 'Build JWT authentication endpoints with Express and MongoDB: /register, /login, and /me. Secure password storage with bcrypt salt hashing and route authorization.',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      maxScore: 100,
      createdBy: teacherUsers[0]._id
    });

    // 7. Create Submissions
    await Submission.create({
      assignment: assignment1._id,
      student: studentUsers[0]._id,
      course: courses[0]._id,
      submissionText: 'Completed the React Product Catalog with full Tailwind CSS styling, responsive grid, dynamic category filtering, and debounced search.',
      fileUrl: 'https://github.com/example/alex-react-catalog',
      status: 'graded',
      score: 95,
      feedback: 'Outstanding implementation! Clean component hierarchy and great use of Tailwind CSS classes.',
      gradedBy: teacherUsers[0]._id,
      gradedAt: new Date()
    });

    await Submission.create({
      assignment: assignment1._id,
      student: studentUsers[1]._id,
      course: courses[0]._id,
      submissionText: 'Implemented all required features including responsive cards and search filters.',
      fileUrl: 'https://github.com/example/maya-catalog',
      status: 'submitted'
    });

    // 8. Create Quizzes
    const quiz1 = await Quiz.create({
      course: courses[0]._id,
      title: 'React Fundamentals & Component Lifecycle Quiz',
      description: 'Test your understanding of React hooks, JSX syntax, virtual DOM, and component rendering triggers.',
      timeLimitMinutes: 15,
      passingScore: 70,
      createdBy: teacherUsers[0]._id,
      status: 'published',
      questions: [
        {
          questionText: 'What is the primary purpose of the React `useEffect` hook?',
          options: [
            'To directly modify browser window resolution',
            'To perform side effects such as data fetching, subscriptions, or DOM mutations',
            'To store encrypted authentication tokens in HTML attributes',
            'To compile JSX templates into CSS stylesheet files'
          ],
          correctOptionIndex: 1,
          points: 25
        },
        {
          questionText: 'Which keyword in JavaScript is used to export a default component from a module?',
          options: ['export default', 'module.exports.main', 'package export', 'define.component'],
          correctOptionIndex: 0,
          points: 25
        },
        {
          questionText: 'Why should keys be provided when rendering a list of elements in React?',
          options: [
            'To specify the CSS z-index stacking order',
            'To allow React to identify which items have changed, been added, or removed',
            'To automatically encrypt the list data across network sockets',
            'Keys are purely decorative and have no functional impact'
          ],
          correctOptionIndex: 1,
          points: 25
        },
        {
          questionText: 'In Tailwind CSS, which class adds a flexbox layout container?',
          options: ['display-flex', 'flex', 'box-flex', 'layout-flex'],
          correctOptionIndex: 1,
          points: 25
        }
      ]
    });

    // Quiz Result for student Alex Turner
    await Result.create({
      quiz: quiz1._id,
      student: studentUsers[0]._id,
      course: courses[0]._id,
      answers: [
        { questionIndex: 0, selectedOptionIndex: 1, isCorrect: true },
        { questionIndex: 1, selectedOptionIndex: 0, isCorrect: true },
        { questionIndex: 2, selectedOptionIndex: 1, isCorrect: true },
        { questionIndex: 3, selectedOptionIndex: 1, isCorrect: true }
      ],
      totalQuestions: 4,
      correctAnswers: 4,
      score: 100,
      maxScore: 100,
      percentage: 100,
      passed: true,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    // 9. Create Enrollments
    await Enrollment.create([
      {
        student: studentUsers[0]._id,
        course: courses[0]._id,
        status: 'active',
        progressPercentage: 60,
        completedLessons: [lessonsCourse1[0]._id, lessonsCourse1[1]._id, lessonsCourse1[2]._id]
      },
      {
        student: studentUsers[0]._id,
        course: courses[2]._id,
        status: 'active',
        progressPercentage: 40,
        completedLessons: []
      },
      {
        student: studentUsers[1]._id,
        course: courses[0]._id,
        status: 'active',
        progressPercentage: 40,
        completedLessons: [lessonsCourse1[0]._id, lessonsCourse1[1]._id]
      },
      {
        student: studentUsers[1]._id,
        course: courses[1]._id,
        status: 'active',
        progressPercentage: 80,
        completedLessons: []
      },
      {
        student: studentUsers[2]._id,
        course: courses[2]._id,
        status: 'active',
        progressPercentage: 75,
        completedLessons: []
      },
      {
        student: studentUsers[3]._id,
        course: courses[0]._id,
        status: 'active',
        progressPercentage: 20,
        completedLessons: [lessonsCourse1[0]._id]
      },
      {
        student: studentUsers[4]._id,
        course: courses[0]._id,
        status: 'active',
        progressPercentage: 80,
        completedLessons: [lessonsCourse1[0]._id, lessonsCourse1[1]._id, lessonsCourse1[2]._id, lessonsCourse1[3]._id]
      }
    ]);

    // 10. Create Attendance Records
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    await Attendance.create([
      {
        course: courses[0]._id,
        date: twoDaysAgo,
        markedBy: teacherUsers[0]._id,
        records: [
          { student: studentUsers[0]._id, status: 'present', remarks: 'On time' },
          { student: studentUsers[1]._id, status: 'present', remarks: 'Active in class' },
          { student: studentUsers[3]._id, status: 'present', remarks: 'Participated' },
          { student: studentUsers[4]._id, status: 'late', remarks: 'Joined 10 mins late' }
        ]
      },
      {
        course: courses[0]._id,
        date: yesterday,
        markedBy: teacherUsers[0]._id,
        records: [
          { student: studentUsers[0]._id, status: 'present', remarks: 'Good interaction' },
          { student: studentUsers[1]._id, status: 'absent', remarks: 'Medical notice' },
          { student: studentUsers[3]._id, status: 'present', remarks: 'On time' },
          { student: studentUsers[4]._id, status: 'present', remarks: 'On time' }
        ]
      },
      {
        course: courses[0]._id,
        date: today,
        markedBy: teacherUsers[0]._id,
        records: [
          { student: studentUsers[0]._id, status: 'present', remarks: 'Submitted homework' },
          { student: studentUsers[1]._id, status: 'present', remarks: 'On time' },
          { student: studentUsers[3]._id, status: 'late', remarks: 'Transit delay' },
          { student: studentUsers[4]._id, status: 'present', remarks: 'On time' }
        ]
      }
    ]);

    // 11. Create Notifications
    await Notification.create([
      {
        title: 'Welcome to the New Academic Semester!',
        message: 'The LMS portal is now live with updated course curriculums, interactive video lectures, and live code reviews.',
        type: 'announcement',
        recipient: null, // broadcast to all
        link: '/courses'
      },
      {
        title: 'New Assignment Published: CS-101',
        message: 'Assignment "Build a Responsive Product Card & Catalog in React" has been assigned. Due in 7 days.',
        type: 'assignment',
        recipient: null,
        link: `/courses/${courses[0]._id}`
      },
      {
        title: 'Quiz 1 Available: React Fundamentals',
        message: 'Test your knowledge on React lifecycle, hooks, and virtual DOM in the newly released quiz.',
        type: 'quiz',
        recipient: null,
        link: `/courses/${courses[0]._id}`
      }
    ]);

    console.log('[Seed] Database seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('Admin:   admin@lms.com         / admin123');
    console.log('Teacher: sarah.jenkins@lms.com / teacher123');
    console.log('Student: alex.turner@lms.com   / student123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
