import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Folders from './pages/Folders';
import FolderDetail from './pages/FolderDetail';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser(JSON.parse(localStorage.getItem('user')));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div className="bg-black text-white h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Router>
      <div className="bg-black text-white min-h-screen">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register setUser={setUser} />} />
          <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
          <Route path="/profile/:userId" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/folders" element={user ? <Folders /> : <Navigate to="/login" />} />
          <Route path="/folder/:folderId" element={user ? <FolderDetail /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
