
import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppContext } from '../App';
import AdminLogin from '../components/admin/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';
import MovieForm from '../components/admin/MovieForm'; 

const AdminPage: React.FC = () => {
  const { isAdmin } = useContext(AppContext);

  return (
    <Routes>
      <Route path="/" element={isAdmin ? <Navigate to="dashboard" replace /> : <AdminLogin />} />
      {isAdmin && (
        <>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="add-movie" element={<MovieForm />} />
          <Route path="edit-movie/:id" element={<MovieForm />} />
        </>
      )}
      {/* Fallback for any other admin routes if not logged in */}
      {!isAdmin && <Route path="*" element={<Navigate to="/admin" replace />} />}
    </Routes>
  );
};

export default AdminPage;