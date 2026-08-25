import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateForm from './pages/CreateForm';
import EditForm from './pages/EditForm';
import ViewForm from './pages/ViewForm';


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user-dashboard" element={<UserDashboard/>} />
        <Route path="/admin-dashboard" element={<AdminDashboard/>} />
        <Route path="/create-form" element={<CreateForm/>} />
        <Route path="/edit-form/:id" element={<EditForm/>} />
        <Route path="/view-form/:id" element={<ViewForm/>} />
      </Routes>
    </Router>
  );
}
