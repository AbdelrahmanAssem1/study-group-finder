import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SessionForm from './pages/SessionForm';
import SessionDetail from './pages/SessionDetail';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/sessions/:id" element={<SessionDetail />} />
          <Route path="/sessions/create" element={
            <PrivateRoute><SessionForm /></PrivateRoute>
          } />
          <Route path="/sessions/:id/edit" element={
            <PrivateRoute><SessionForm /></PrivateRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e2433',
              color: '#f0f2f7',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px',
              fontSize: '0.9rem',
            },
            success: { iconTheme: { primary: '#4caf82', secondary: '#1e2433' } },
            error: { iconTheme: { primary: '#f06565', secondary: '#1e2433' } },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
