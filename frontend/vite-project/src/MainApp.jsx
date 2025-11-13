// import React, { useState, useEffect } from 'react';
// import { useAuth } from './contexts/AuthContext';
// import Welcome from './pages/Welcome';
// import Login from './pages/Login';
// import Signup from './pages/Signup';
// import Dashboard from './pages/Dashboard';
// import ForgotPassword from "./pages/ForgotPassword";  // NEW
// import ResetPassword from "./pages/ResetPassword";    // NEW
// import App from './App';

// const MainApp = () => {
//   const { isAuthenticated, loading, user } = useAuth();
//   const [currentPage, setCurrentPage] = useState('welcome');
//   const [showMessage, setShowMessage] = useState('');

//   useEffect(() => {
//     // If user is authenticated, show dashboard by default
//     if (isAuthenticated && currentPage === 'welcome') {
//       setCurrentPage('dashboard');
//     }
//   }, [isAuthenticated]);

//   const handleShowMessage = (message) => {
//     setShowMessage(message);
//     setTimeout(() => setShowMessage(''), 3000);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
//         <div className="text-white text-xl">Loading...</div>
//       </div>
//     );
//   }

//   // Show appropriate page based on current state
//   if (currentPage === 'login') {
//     return (
//       <Login
//         onSwitchToSignup={() => setCurrentPage('signup')}
//         onForgotPassword={() => setCurrentPage('forgot-password')}  // NEW
//         onBack={() => setCurrentPage(isAuthenticated ? 'dashboard' : 'welcome')}
//         onLoginSuccess={() => {
//           handleShowMessage('Successfully logged in!');
//           setCurrentPage('dashboard');
//         }}
//       />
//     );
//   }

//   if (currentPage === 'signup') {
//     return (
//       <Signup
//         onSwitchToLogin={() => setCurrentPage('login')}
//         onBack={() => setCurrentPage(isAuthenticated ? 'dashboard' : 'welcome')}
//         onSignupSuccess={() => {
//           handleShowMessage('Account created successfully!');
//           setCurrentPage('dashboard');
//         }}
//       />
//     );
//   }

//   // NEW: Forgot Password page
//   if (currentPage === 'forgot-password') {
//     return (
//       <ForgotPassword
//         onBack={() => setCurrentPage('login')}
//         onSuccess={(token) => {
//           // In dev mode, navigate to reset password with token
//           if (token) {
//             setCurrentPage('reset-password');
//             // Store token temporarily for dev mode
//             sessionStorage.setItem('resetToken', token);
//           }
//         }}
//       />
//     );
//   }

//   // NEW: Reset Password page
//   if (currentPage === 'reset-password') {
//     return (
//       <ResetPassword
//         onBack={() => setCurrentPage('login')}
//         onSuccess={() => {
//           handleShowMessage('Password reset successful!');
//           setCurrentPage('login');
//         }}
//       />
//     );
//   }

//   if (currentPage === 'interview') {
//     return <App onBack={() => setCurrentPage('dashboard')} />;
//   }

//   if (currentPage === 'dashboard' && isAuthenticated) {
//     return (
//       <Dashboard 
//         onStartInterview={() => setCurrentPage('interview')}
//         onLogout={() => {
//           handleShowMessage('Logged out successfully');
//           setCurrentPage('welcome');
//         }}
//       />
//     );
//   }

//   // Welcome page - entry point for non-authenticated users
//   return (
//     <>
//       {showMessage && (
//         <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
//           {showMessage}
//         </div>
//       )}
//       <Welcome
//         onGetStarted={() => setCurrentPage(isAuthenticated ? 'dashboard' : 'signup')}
//         onLogin={() => setCurrentPage('login')}
//       />
//     </>
//   );
// };

// export default MainApp;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import App from './App';  // This is your interview page

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const MainApp = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Welcome />} 
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default MainApp;