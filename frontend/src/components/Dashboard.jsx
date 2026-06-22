import React from 'react';
import { useUser } from '../context/UserContext';
import { 
  Award, 
  Calendar, 
  CheckSquare, 
  Play, 
  ArrowRight,
  ShieldAlert,
  BookOpen
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = ({ setCurrentView }) => {
  const { stats, learningPath, interviews } = useUser();

  const totalModules = learningPath?.modules?.length || 0;
  const completedModules = learningPath?.modules?.filter(m => m.status === 'completed').length || 0;
  const learningPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  // Find overall next module to complete
  const nextModule = learningPath?.modules?.find(m => m.status === 'pending');

  // SVG Chart Calculation helpers
  const scoreHistory = stats?.scoreHistory || [];
  const svgWidth = 500;
  const svgHeight = 150;
  const padding = 20;

  const renderChart = () => {
    if (scoreHistory.length === 0) {
      return (
        <div className="chart-empty-state">
          <BookOpen size={36} />
          <p>No interviews completed yet. Start practicing to generate score history charts!</p>
        </div>
      );
    }

    const maxScore = 100;
    const minScore = 0;
    
    // Generate coordinate points for SVG line
    const points = scoreHistory.map((item, index) => {
      const x = padding + (index * (svgWidth - 2 * padding)) / Math.max(1, scoreHistory.length - 1);
      const y = svgHeight - padding - ((item.score - minScore) * (svgHeight - 2 * padding)) / (maxScore - minScore);
      return { x, y, score: item.score, date: item.date, track: item.track };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    // Generate fill path for area underneath
    const areaPath = points.length > 0 
      ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z` 
      : '';

    return (
      <div className="svg-chart-container">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="100%">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4 4" />
          <line x1={padding} y1={svgHeight / 2} x2={svgWidth - padding} y2={svgHeight / 2} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4 4" />
          <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="var(--border-color)" strokeWidth="1" />

          {/* Area under line */}
          {areaPath && <path d={areaPath} fill="url(#chartGrad)" />}

          {/* Trend line */}
          {linePath && (
            <path 
              d={linePath} 
              fill="none" 
              stroke="var(--accent-primary)" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          )}

          {/* Data points */}
          {points.map((p, i) => (
            <g key={i} className="chart-dot-group">
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="5" 
                fill="var(--bg-primary)" 
                stroke="var(--accent-secondary)" 
                strokeWidth="2.5" 
              />
              <text 
                x={p.x} 
                y={p.y - 10} 
                fontSize="8.5" 
                fill="var(--text-primary)" 
                textAnchor="middle" 
                fontWeight="bold"
              >
                {p.score}%
              </text>
              <text 
                x={p.x} 
                y={svgHeight - 4} 
                fontSize="7.5" 
                fill="var(--text-muted)" 
                textAnchor="middle"
              >
                {p.date}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card glass-panel">
          <div className="metric-icon-wrapper">
            <Award size={22} />
          </div>
          <div className="metric-info">
            <h3>Average Score</h3>
            <p>{stats?.averageScore || 0}%</p>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrapper" style={{ color: 'var(--success-color)', background: 'rgba(16, 185, 129, 0.1)' }}>
            <CheckSquare size={22} />
          </div>
          <div className="metric-info">
            <h3>Completed Mock Sessions</h3>
            <p>{stats?.totalInterviews || 0}</p>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrapper" style={{ color: 'var(--warning-color)', background: 'rgba(245, 158, 11, 0.1)' }}>
            <Calendar size={22} />
          </div>
          <div className="metric-info">
            <h3>Roadmap Progress</h3>
            <p>{learningPercentage}%</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content-layout">
        {/* Left Side: Score Trend & Category metrics */}
        <div className="dashboard-left-panel">
          {/* Chart Card */}
          <div className="dashboard-card glass-panel">
            <div className="card-header">
              <h2>Score History</h2>
              <span className="card-tag">Performance Trend</span>
            </div>
            <div className="card-body">
              {renderChart()}
            </div>
          </div>

          {/* Skill Breakdown */}
          <div className="dashboard-card glass-panel">
            <div className="card-header">
              <h2>Skill Assessment Breakdown</h2>
              <span className="card-tag">Core Dimensions</span>
            </div>
            <div className="card-body">
              <div className="skill-bars-list">
                {[
                  { label: 'Technical Skills & Logic', value: stats?.categoryScores?.technicalSkills || 0, color: 'var(--accent-primary)' },
                  { label: 'Explanation & Communication', value: stats?.categoryScores?.communication || 0, color: 'var(--accent-secondary)' },
                  { label: 'Depth of Knowledge', value: stats?.categoryScores?.knowledge || 0, color: 'var(--info-color)' },
                  { label: 'Tone & Confidence', value: stats?.categoryScores?.confidence || 0, color: 'var(--success-color)' }
                ].map((skill, idx) => (
                  <div key={idx} className="skill-bar-row">
                    <div className="skill-bar-labels">
                      <span className="skill-bar-name">{skill.label}</span>
                      <span className="skill-bar-value">{skill.value}%</span>
                    </div>
                    <div className="skill-bar-track">
                      <div 
                        className="skill-bar-fill" 
                        style={{ width: `${skill.value}%`, backgroundColor: skill.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Next Actions & Learning Roadmaps */}
        <div className="dashboard-right-panel">
          {/* Quickstart Card */}
          <div className="dashboard-card glass-panel action-glow-card">
            <div className="card-header">
              <h2 className="gradient-text">Practice Simulator</h2>
            </div>
            <div className="card-body">
              <p className="action-desc">
                Engage in full-length mock interviews designed dynamically by Gemini AI to review communication strengths and get real-time feedback.
              </p>
              <button 
                className="btn btn-primary w-full" 
                onClick={() => setCurrentView('interview')}
                style={{ marginTop: '16px', width: '100%' }}
              >
                <Play size={18} />
                <span>Start Mock Interview</span>
              </button>
            </div>
          </div>

          {/* Next Roadmap Step */}
          <div className="dashboard-card glass-panel">
            <div className="card-header">
              <h2>Roadmap Task</h2>
              <span className="card-tag tag-success">Active Path</span>
            </div>
            <div className="card-body">
              {nextModule ? (
                <div className="roadmap-next-module">
                  <h4 className="next-mod-title">{nextModule.title}</h4>
                  <p className="next-mod-desc">{nextModule.description.slice(0, 120)}...</p>
                  
                  <button 
                    className="btn btn-secondary w-full"
                    onClick={() => setCurrentView('learning')}
                    style={{ marginTop: '16px', width: '100%' }}
                  >
                    <span>Go to Learning Path</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="roadmap-completed-state">
                  <p>🎉 All current modules completed! Generate a new learning path in settings or path tabs to continue.</p>
                </div>
              )}
            </div>
          </div>

          {/* Profile Quick Summary */}
          <div className="dashboard-card glass-panel">
            <div className="card-header">
              <h2>Target Profile</h2>
            </div>
            <div className="card-body">
              <div className="profile-summary-item">
                <span className="p-label">Role:</span>
                <span className="p-value">{stats?.user?.targetRole || 'Full Stack Engineer'}</span>
              </div>
              <div className="profile-summary-item">
                <span className="p-label">Level:</span>
                <span className="p-value">{stats?.user?.experienceLevel || 'Mid Level'}</span>
              </div>
              <button 
                className="btn btn-secondary w-full"
                onClick={() => setCurrentView('settings')}
                style={{ marginTop: '16px', width: '100%' }}
              >
                <span>Edit Profile Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
