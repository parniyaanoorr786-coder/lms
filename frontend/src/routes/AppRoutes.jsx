import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';

// Dashboard & LMS Module Pages
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { StudentsPage } from '../pages/students/StudentsPage';
import { TeachersPage } from '../pages/teachers/TeachersPage';
import { CoursesPage } from '../pages/courses/CoursesPage';
import { CourseDetailPage } from '../pages/courses/CourseDetailPage';
import { EnrollmentsPage } from '../pages/enrollments/EnrollmentsPage';
import { AssignmentsPage } from '../pages/assignments/AssignmentsPage';
import { QuizzesPage } from '../pages/quizzes/QuizzesPage';
import { AttendancePage } from '../pages/attendance/AttendancePage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { NotificationsPage } from '../pages/notifications/NotificationsPage';
import { ProfilePage } from '../pages/profile/ProfilePage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Students (Admin, Teacher) */}
        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <StudentsPage />
            </ProtectedRoute>
          }
        />

        {/* Teachers (Admin) */}
        <Route
          path="/teachers"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TeachersPage />
            </ProtectedRoute>
          }
        />

        {/* Courses & Details (All) */}
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />

        {/* Enrollments (All) */}
        <Route path="/enrollments" element={<EnrollmentsPage />} />

        {/* Assignments (All) */}
        <Route path="/assignments" element={<AssignmentsPage />} />

        {/* Quizzes (All) */}
        <Route path="/quizzes" element={<QuizzesPage />} />

        {/* Attendance (All) */}
        <Route path="/attendance" element={<AttendancePage />} />

        {/* Reports & Analytics (Admin, Teacher) */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Notifications (All) */}
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Profile & Settings (All) */}
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
