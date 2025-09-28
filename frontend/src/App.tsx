import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegisterPage from './pages/Register';
import Analytics from './pages/Analytics';
import Attendance from './pages/Attendance';
import ManageUsers from './pages/ManageUsers';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import AttendanceReports from './pages/AttendanceReports';
import StudentLookup from './pages/StudentLookup'; // <-- IMPORT THE NEW PAGE
import { Toaster } from "@/components/ui/sonner"

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute element={Dashboard} />} />
          <Route path="/register" element={<ProtectedRoute element={RegisterPage} allowedRoles={['admin']} />} />
          <Route path="/analytics" element={<ProtectedRoute element={Analytics} allowedRoles={['admin']} />} />
          <Route path="/attendance" element={<ProtectedRoute element={Attendance} allowedRoles={['teacher']} />} />
          <Route path="/reports" element={<ProtectedRoute element={AttendanceReports} allowedRoles={['student']} />} />
          <Route path="/users" element={<ProtectedRoute element={ManageUsers} allowedRoles={['admin']} />} />
          <Route path="/student-lookup" element={<ProtectedRoute element={StudentLookup} allowedRoles={['admin']} />} /> {/* <-- ADD THIS ROUTE */}
          <Route path="/profile" element={<ProtectedRoute element={Profile} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

export default App;