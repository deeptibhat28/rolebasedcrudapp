import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateForm from './pages/CreateForm';
import EditForm from './pages/EditForm';
import ViewForm from './pages/ViewForm';
import AdminFormDetails from './pages/AdminFormDetails';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Setup2FA from './components/Setup2FA';
import ActivityLogs from "./pages/ActivityLogs";




export default function App() {
  return (
    <div>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user-dashboard" element={<UserDashboard/>} />
        <Route path="/admin-dashboard" element={<AdminDashboard/>} />
        <Route path="/create-form" element={<CreateForm/>} />
        <Route path="/edit-form/:id" element={<EditForm/>} />
        <Route path="/view-form/:id" element={<ViewForm/>} />
        <Route path="/admin/form-details/:id" element={<AdminFormDetails/>} /> 
        <Route path='/setup-2fa' element={<Setup2FA/>} />
        <Route path='/activity-logs' element={<ActivityLogs/>} />
      </Routes>
    </Router>

    <ToastContainer position="top-center" autoClose={2000}  closeOnClick />
    </div>
  );
}
