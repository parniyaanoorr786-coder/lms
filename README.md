# EduFlow LMS - Full Stack Learning Management System

EduFlow LMS is a professional, modern, fully functional Full Stack Learning Management System (LMS) built with **React.js (Vite)**, **Tailwind CSS**, **Node.js**, **Express.js**, and **MongoDB**.

The application features a clean, responsive white-and-blue SaaS aesthetic with complete role-based access control for **Admin**, **Teacher**, and **Student** roles.

---

## 🚀 Key Technologies

### Frontend
- **React.js (Vite)** – High-performance Single Page Application (SPA)
- **Tailwind CSS** – Custom-tailored modern white-and-blue SaaS theme
- **React Router DOM (v6)** – Declarative routing with protected role guards
- **Axios** – Centralized HTTP client with token injection & error interceptors
- **Recharts** – Interactive responsive charts (Area, Bar, and Pie charts)
- **Lucide React** – Clean, modern icon set

### Backend
- **Node.js & Express.js** – Modular RESTful API architecture
- **MongoDB & Mongoose** – Scalable NoSQL document store with strict validation
- **JWT (JSON Web Tokens)** – Secure stateless session authentication
- **bcrypt.js** – Salted password hashing
- **Multer** – Multi-format media and document file upload handler
- **CORS & Morgan** – Cross-Origin Resource Sharing and HTTP request logger

---

## 📁 Project Structure

Frontend and backend codebases are completely separated inside the main project directory:

```text
lms-management-system/
│
├── frontend/                          # React + Vite + Tailwind Client
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/                # Reusable UI components
│   │   │   ├── ConfirmDialog.jsx      # Confirmation modals
│   │   │   ├── DataTable.jsx          # Reusable tables with search & pagination
│   │   │   ├── Modal.jsx              # Accessible modal dialogs
│   │   │   ├── Navbar.jsx             # Top bar with notifications & profile dropdown
│   │   │   ├── Sidebar.jsx            # Role-tailored navigation sidebar
│   │   │   ├── StatCard.jsx           # Dashboard KPI statistic cards
│   │   │   └── ToastContainer.jsx     # Floating notifications / alert toasts
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # Global authentication provider
│   │   │   └── NotificationContext.jsx# Live notifications & toast alert provider
│   │   ├── layouts/
│   │   │   ├── AuthLayout.jsx         # Card layout for sign in / registration
│   │   │   └── DashboardLayout.jsx    # Master dashboard shell
│   │   ├── pages/
│   │   │   ├── assignments/           # Assignments management & grading
│   │   │   ├── attendance/            # Attendance register & tracking
│   │   │   ├── auth/                  # Login, Register, Forgot Password
│   │   │   ├── courses/               # Course catalog & single course hub
│   │   │   ├── dashboard/             # Role-based dashboard with Recharts
│   │   │   ├── enrollments/           # Course enrollments management
│   │   │   ├── notifications/         # Broadcast announcements center
│   │   │   ├── profile/               # User profile & password settings
│   │   │   ├── quizzes/               # Quizzes taking & results breakdown
│   │   │   ├── reports/               # System performance & enrollment analytics
│   │   │   ├── students/              # Full student management CRUD
│   │   │   └── teachers/              # Faculty instructors & course assignment
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx          # Application route definitions
│   │   │   └── ProtectedRoute.jsx     # Role-based route authorization guards
│   │   ├── services/
│   │   │   └── api.js                 # Centralized Axios API service
│   │   ├── utils/
│   │   │   └── helpers.js             # Formatting & badge helpers
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                           # Node.js + Express + MongoDB Server
│   ├── config/
│   │   └── db.js                      # Mongoose connection config
│   ├── controllers/                   # Complete CRUD controllers
│   │   ├── assignmentController.js
│   │   ├── attendanceController.js
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── dashboardController.js
│   │   ├── enrollmentController.js
│   │   ├── lessonController.js
│   │   ├── notificationController.js
│   │   ├── quizController.js
│   │   ├── reportController.js
│   │   ├── studentController.js
│   │   └── teacherController.js
│   ├── middleware/
│   │   ├── authMiddleware.js          # JWT verification & role authorization
│   │   ├── errorMiddleware.js         # Centralized error handler
│   │   └── uploadMiddleware.js        # Multer file upload storage
│   ├── models/                        # 12 Mongoose database models
│   │   ├── Assignment.js
│   │   ├── Attendance.js
│   │   ├── Course.js
│   │   ├── Enrollment.js
│   │   ├── Lesson.js
│   │   ├── Notification.js
│   │   ├── Quiz.js
│   │   ├── Result.js
│   │   ├── Student.js
│   │   ├── Submission.js
│   │   ├── Teacher.js
│   │   └── User.js
│   ├── routes/                        # Express API route modules
│   ├── uploads/                       # Uploaded files and media
│   ├── utils/
│   │   └── seed.js                    # Rich sample database seeder
│   ├── .env.example
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 🔑 Pre-Configured Demo Credentials

The database can be seeded with realistic sample data using `npm run seed` in `backend/`. The following accounts are available immediately:

| Role | Email Address | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@lms.com` | `admin123` | Full access: all students, faculty, courses, enrollments, reports, and broadcast announcements |
| **Teacher** | `sarah.jenkins@lms.com` | `teacher123` | Course management, lessons upload, assignment creation, student grading, attendance register |
| **Student** | `alex.turner@lms.com` | `student123` | Course enrollment, video lectures, homework submissions, taking quizzes, progress tracking |

*(You can also use the **1-Click Demo Login** buttons on the Login page to instantly fill credentials).*

---

## 🛠️ Installation & Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Installed locally on port 27017 or a MongoDB Atlas cloud URI

---

### Step 1: Backend Setup

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd lms-management-system/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env` (a pre-configured `.env` is already provided):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/lms_database
   JWT_SECRET=supersecret_jwt_key_lms_management_2026_secure
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ```
   *(For MongoDB Atlas, replace `MONGODB_URI` with your connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/lms_database?retryWrites=true&w=majority`).*

4. Seed the database with sample courses, lessons, quizzes, assignments, and users:
   ```bash
   npm run seed
   ```

5. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   The backend API will run on `http://localhost:5000`.

---

### Step 2: Frontend Setup

1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd lms-management-system/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

4. To build for production:
   ```bash
   npm run build
   ```

---

## 🌟 Modules & Features Overview

### 1. Authentication System
- JWT token-based authentication with bcrypt password hashing
- Role-based authorization (`admin`, `teacher`, `student`)
- Login with Remember Me & 1-Click demo accounts
- User Registration with department and role selection
- Forgot Password token generator and reset form
- Automatic session validation and clean sign-out

### 2. Admin & Role Dashboards
- **Admin**: KPIs for Students, Teachers, Courses, and Enrollments; Recharts Area chart for Monthly Enrollment Trend; Recharts Pie chart for Category Distribution; Recent Registrations and Course Enrollments.
- **Teacher**: KPIs for My Courses, Total Students Enrolled, Assignments, and Pending Submissions to Grade; Bar chart for Course Enrollment distribution; Recent Submissions queue.
- **Student**: Enrolled Courses progress bars, Average Progress KPI, Upcoming assignment deadlines, and Recent quiz scores.

### 3. Student Management
- Complete CRUD operations: Add Student, Edit Details, Delete Record
- Filter students by Department and Academic Status (Active, Inactive, Graduated)
- Real-time search by name, student ID, and email
- Student Profile modal showing academic standing, contact info, and course enrollment progress

### 4. Teacher Management
- View all academic faculty members
- Create new instructor profiles with department, qualification, and specialization
- **Assign Courses Modal**: Assign courses to specific teachers
- Edit and delete faculty profiles

### 5. Course & Curriculum Management
- Category tabs (Web Development, Data Science, Design, Cloud Computing, Cybersecurity)
- Course creation with duration, difficulty level, thumbnail image, price, and assigned instructor
- Course Hub with tabbed navigation:
  - **Overview**: Course description, metadata, and instructor profile
  - **Lessons**: Video lecture modal player, study material downloads, lesson completion checkboxes
  - **Assignments**: Homework requirements, deadlines, submission portal, and grading review
  - **Quizzes**: Assessment quizzes with questions and instant grading
  - **Enrolled Students**: Roster of enrolled learners and progress rates

### 6. Lesson Management
- Upload and organize lessons by sequence order
- Embedded video lecture player modal supporting YouTube, Vimeo, and custom MP4 streams
- Downloadable study materials (PDFs, slide decks, reference manuals)
- Toggle completion checkbox for enrolled students with dynamic progress calculation

### 7. Assignment & Homework Management
- Create assignments with deadlines and max point values
- Students submit notes and external repository or project links
- Instructors review student submissions, enter scores, and give personalized feedback
- Automatic student notification on grading

### 8. Quiz & Assessment Center
- Multiple Choice Questions (MCQ) builder with custom answer options and point values
- Interactive quiz mode with countdown timer
- Instant automated scoring, pass/fail evaluation, and detailed answers review

### 9. Attendance Register
- Course-based daily attendance sheet
- Quick status toggles: **Present**, **Absent**, **Late**
- Session remarks input per student
- Individual student attendance percentage summary across all enrolled courses

### 10. Reports & Analytics
- Monthly enrollment trends powered by Recharts Line Chart
- Subject category breakdown powered by Recharts Bar Chart
- Platform KPIs: Total enrollments, course completion rates, quiz pass rates, homework grading rates
- Top performing courses table

### 11. Notification System
- Broadcast announcements for institution-wide news
- Automated notifications for new assignments, quizzes, and grades
- Notification bell dropdown with unread counter
- Mark as read and filter by category

### 12. Profile & Settings
- Update full name, phone number, physical address, bio, and avatar
- Password change form with current password verification
- Academic ID display

---

## 📡 API Reference Summary

| Endpoint | Method | Description | Access |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Register a new user | Public |
| `/api/auth/login` | `POST` | Authenticate and get JWT token | Public |
| `/api/auth/me` | `GET` | Get current user profile | Private |
| `/api/auth/profile` | `PUT` | Update profile information | Private |
| `/api/auth/change-password` | `PUT` | Change account password | Private |
| `/api/auth/forgot-password` | `POST` | Generate password reset token | Public |
| `/api/auth/reset-password/:token`| `POST` | Reset password using token | Public |
| `/api/dashboard/stats` | `GET` | Get role-tailored dashboard metrics | Private |
| `/api/students` | `GET/POST` | List students / Create student | Admin/Teacher |
| `/api/students/:id` | `GET/PUT/DELETE` | View / Update / Delete student | Admin |
| `/api/teachers` | `GET/POST` | List teachers / Create teacher | Private/Admin |
| `/api/teachers/:id/courses` | `PUT` | Assign courses to instructor | Admin |
| `/api/courses` | `GET/POST` | List courses / Create course | Public/Admin/Teacher |
| `/api/courses/:id` | `GET/PUT/DELETE` | Course details / Update / Delete | Private/Admin/Teacher |
| `/api/enrollments` | `GET/POST` | List enrollments / Enroll student | Private |
| `/api/enrollments/my` | `GET` | Get logged-in student enrollments | Student |
| `/api/lessons` | `POST` | Create a new lesson | Admin/Teacher |
| `/api/lessons/:id/toggle-completion` | `POST` | Toggle lesson completion | Student |
| `/api/assignments` | `POST` | Post a new assignment | Admin/Teacher |
| `/api/assignments/:id/submit`| `POST` | Submit assignment work | Student |
| `/api/assignments/submissions/:id/grade` | `PUT` | Grade a submission | Admin/Teacher |
| `/api/quizzes` | `POST` | Create a quiz | Admin/Teacher |
| `/api/quizzes/:id/submit` | `POST` | Submit quiz answers & auto-grade | Student |
| `/api/attendance` | `POST` | Mark attendance for date & course | Admin/Teacher |
| `/api/attendance/student/:id`| `GET` | Get student attendance history | Private |
| `/api/reports/analytics` | `GET` | Get system-wide reports | Admin |
| `/api/notifications` | `GET/POST` | Get notifications / Create alert | Private |
| `/api/upload` | `POST` | Upload file/media attachment | Private |

---

## 🔒 Security Best Practices
- Passwords salted and hashed with **bcryptjs** (10 salt rounds)
- JWT tokens signed with strong secret and validated on every protected route
- MongoDB injection prevention via Mongoose schema type checking
- Strict Role-Based Access Control (RBAC) middleware verifying roles before sensitive operations
- Static asset serving protected with sanitized filenames
- Cross-Origin Resource Sharing (CORS) configured

---

© 2026 EduFlow LMS Management System. Built with React.js, Tailwind CSS, Node.js, Express.js, and MongoDB.
