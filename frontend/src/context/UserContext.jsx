import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();
const API_BASE = 'http://localhost:5000/api';

export const UserProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('auth_token') || null);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [learningPath, setLearningPath] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(true);

  // Apply dark/light theme class on HTML element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Helper for auth headers
  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        if (res.status === 401) logout();
        return;
      }
      const data = await res.json();
      setUser(data);
      return data;
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    }
  };



  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    setStats(null);
    setInterviews([]);
    setLearningPath(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user profile.');
      }
      setUser(data);
      // Re-fetch stats in case role/level changed
      fetchStats();
      return data;
    } catch (err) {
      console.error('Error updating user profile:', err);
      throw err;
    }
  };

  const fetchStats = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/users/stats`, {
        headers: getHeaders()
      });
      if (!res.ok) return;
      const data = await res.json();
      setStats(data);
      return data;
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  const fetchInterviews = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/interviews`, {
        headers: getHeaders()
      });
      if (!res.ok) return;
      const data = await res.json();
      setInterviews(data);
      return data;
    } catch (err) {
      console.error('Error fetching interviews:', err);
    }
  };

  const fetchLearningPath = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/learning`, {
        headers: getHeaders()
      });
      if (!res.ok) return;
      const data = await res.json();
      setLearningPath(data);
      return data;
    } catch (err) {
      console.error('Error fetching learning path:', err);
    }
  };

  const generateNewLearningPath = async (targetRole, experienceLevel) => {
    try {
      const res = await fetch(`${API_BASE}/learning/generate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ targetRole, experienceLevel })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate learning roadmap.');
      }
      setLearningPath(data);
      return data;
    } catch (err) {
      console.error('Error generating learning path:', err);
      throw err;
    }
  };

  const toggleModuleStatus = async (moduleId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      const res = await fetch(`${API_BASE}/learning/module/${moduleId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to toggle module status.');
      }
      setLearningPath(data);
      return data;
    } catch (err) {
      console.error('Error toggling module status:', err);
      throw err;
    }
  };

  const startNewInterview = async (track, difficulty) => {
    try {
      const res = await fetch(`${API_BASE}/interviews`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ track, difficulty })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start interview.');
      }
      fetchInterviews();
      return data;
    } catch (err) {
      console.error('Error starting interview:', err);
      throw err;
    }
  };

  const submitInterviewAnswer = async (interviewId, questionIndex, answerText) => {
    try {
      const res = await fetch(`${API_BASE}/interviews/${interviewId}/answer`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ questionIndex, answerText })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze answer.');
      }
      return data;
    } catch (err) {
      console.error('Error submitting answer:', err);
      throw err;
    }
  };

  const completeInterviewSession = async (interviewId) => {
    try {
      const res = await fetch(`${API_BASE}/interviews/${interviewId}/complete`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete interview.');
      }
      fetchInterviews();
      fetchStats();
      return data;
    } catch (err) {
      console.error('Error completing interview:', err);
      throw err;
    }
  };

  const deleteInterviewSession = async (interviewId) => {
    try {
      const res = await fetch(`${API_BASE}/interviews/${interviewId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete interview.');
      }
      fetchInterviews();
      fetchStats();
      return data;
    } catch (err) {
      console.error('Error deleting interview session:', err);
      throw err;
    }
  };

  // Sync Auth Data
  useEffect(() => {
    const initData = async () => {
      if (token) {
        setLoading(true);
        const profile = await fetchProfile();
        if (profile) {
          await Promise.all([
            fetchStats(),
            fetchInterviews(),
            fetchLearningPath()
          ]);
        }
        setLoading(false);
      } else {
        setUser(null);
        setStats(null);
        setInterviews([]);
        setLearningPath(null);
        setLoading(false);
      }
    };
    initData();
  }, [token]);

  return (
    <UserContext.Provider value={{
      token,
      user,
      stats,
      interviews,
      learningPath,
      theme,
      loading,
      toggleTheme,
      login,
      register,
      logout,
      updateProfile,
      fetchStats,
      fetchInterviews,
      generateNewLearningPath,
      toggleModuleStatus,
      startNewInterview,
      submitInterviewAnswer,
      completeInterviewSession,
      deleteInterviewSession
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
