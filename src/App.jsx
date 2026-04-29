import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AnimatePresence, motion } from 'framer-motion';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Onboarding from './pages/Onboarding';
import Settings from './pages/Settings';
import SelfHelp from './pages/SelfHelp';
import RecentChats from './pages/RecentChats';
import Resources from './pages/Resources';
import Landing from './pages/Landing';
import Sidebar from './components/Sidebar';
import { getCurrentUser, logoutUser } from './utils/db';
import './index.css';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = ({ isAuthenticated, user, handleLogin, handleLogout, handleOnboardingComplete, refreshUser }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={<PageTransition>{!isAuthenticated ? <Landing /> : <Navigate to="/dashboard" />}</PageTransition>} 
        />
        <Route 
          path="/login" 
          element={<PageTransition>{!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />}</PageTransition>} 
        />
        <Route 
          path="/register" 
          element={<PageTransition>{!isAuthenticated ? <Register onLogin={handleLogin} /> : <Navigate to="/dashboard" />}</PageTransition>} 
        />
        <Route 
          path="/onboarding" 
          element={<PageTransition>{isAuthenticated && !user?.onboardingCompleted ? <Onboarding user={user} onComplete={handleOnboardingComplete} /> : <Navigate to="/dashboard" />}</PageTransition>} 
        />
        
        <Route 
          path="/dashboard" 
          element={<PageTransition>{isAuthenticated && user?.onboardingCompleted ? <Dashboard user={user} /> : <Navigate to={isAuthenticated ? "/onboarding" : "/"} />}</PageTransition>} 
        />
        <Route 
          path="/journal" 
          element={<PageTransition>{isAuthenticated && user?.onboardingCompleted ? <Journal user={user} refreshUser={refreshUser} /> : <Navigate to={isAuthenticated ? "/onboarding" : "/"} />}</PageTransition>} 
        />
        <Route 
          path="/settings" 
          element={<PageTransition>{isAuthenticated && user?.onboardingCompleted ? <Settings user={user} onLogout={handleLogout} refreshUser={refreshUser} /> : <Navigate to={isAuthenticated ? "/onboarding" : "/"} />}</PageTransition>} 
        />
        <Route 
          path="/self-help" 
          element={<PageTransition>{isAuthenticated && user?.onboardingCompleted ? <SelfHelp user={user} /> : <Navigate to={isAuthenticated ? "/onboarding" : "/"} />}</PageTransition>} 
        />
        <Route 
          path="/recent-chats" 
          element={<PageTransition>{isAuthenticated && user?.onboardingCompleted ? <RecentChats user={user} /> : <Navigate to={isAuthenticated ? "/onboarding" : "/"} />}</PageTransition>} 
        />
        <Route 
          path="/resources" 
          element={<PageTransition>{isAuthenticated && user?.onboardingCompleted ? <Resources user={user} /> : <Navigate to={isAuthenticated ? "/onboarding" : "/"} />}</PageTransition>} 
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = () => {
    const sessionUser = getCurrentUser();
    if (sessionUser) {
      setUser(sessionUser);
      setIsAuthenticated(true);
    }
  };

  useEffect(() => {
    refreshUser();
    setLoading(false);
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleOnboardingComplete = (updatedUser) => {
    setUser(updatedUser);
  };

  if (loading) return null;

  return (
    <LanguageProvider>
      <Router>
        <div className="app-container">
          {isAuthenticated && user?.onboardingCompleted && <Sidebar onLogout={handleLogout} user={user} />}
          <main className="content-area">
            <AnimatedRoutes 
              isAuthenticated={isAuthenticated} 
              user={user} 
              handleLogin={handleLogin} 
              handleLogout={handleLogout} 
              handleOnboardingComplete={handleOnboardingComplete}
              refreshUser={refreshUser}
            />
          </main>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;

