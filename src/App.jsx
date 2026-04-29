import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Sidebar from './components/Sidebar';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userMood, setUserMood] = useState('neutral');

  const handleLogin = (mood) => {
    setUserMood(mood);
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <div className="app-container">
        {isAuthenticated && <Sidebar />}
        <main className="content-area">
          <Routes>
            <Route 
              path="/" 
              element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard mood={userMood} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/journal" 
              element={isAuthenticated ? <Journal /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
