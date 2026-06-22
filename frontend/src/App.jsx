import React, { useState } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import InterviewRoom from './components/InterviewRoom';
import LearningPath from './components/LearningPath';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import './App.css';

function MainAppContent() {
  const { token, loading } = useUser();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="platform-loader-screen">
        <div className="loader-spinner">🧠</div>
        <p>Synchronizing platform credentials...</p>
      </div>
    );
  }

  // Render Authentication view if no JWT token is stored
  if (!token) {
    return <Auth />;
  }

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      {currentView === 'dashboard' && <Dashboard setCurrentView={setCurrentView} />}
      {currentView === 'interview' && <InterviewRoom setCurrentView={setCurrentView} />}
      {currentView === 'learning' && <LearningPath />}
      {currentView === 'analytics' && <Analytics />}
      {currentView === 'settings' && <Settings />}
    </Layout>
  );
}

function App() {
  return (
    <UserProvider>
      <MainAppContent />
    </UserProvider>
  );
}

export default App;
