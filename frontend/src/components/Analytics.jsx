import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { 
  Calendar, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  Award, 
  CheckCircle,
  AlertTriangle,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import './Analytics.css';

const Analytics = () => {
  const { stats, interviews, deleteInterviewSession } = useUser();
  const [expandedSessionId, setExpandedSessionId] = useState(null);

  const toggleExpandSession = (id) => {
    setExpandedSessionId(expandedSessionId === id ? null : id);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent toggling expansion
    if (window.confirm('Are you sure you want to delete this interview session history? This action is permanent.')) {
      await deleteInterviewSession(id);
    }
  };

  const getScoreColorClass = (score) => {
    if (score >= 80) return 'score-excellent';
    if (score >= 65) return 'score-good';
    return 'score-needs-work';
  };

  const completedSessions = interviews.filter(s => s.status === 'completed');

  return (
    <div className="analytics-container">
      {/* Analytics Summary Header Cards */}
      <div className="metrics-grid">
        <div className="metric-card glass-panel">
          <div className="metric-icon-wrapper" style={{ color: 'var(--accent-primary)', background: 'rgba(99, 102, 241, 0.1)' }}>
            <Award size={22} />
          </div>
          <div className="metric-info">
            <h3>Average Score</h3>
            <p>{stats?.averageScore || 0}%</p>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrapper" style={{ color: 'var(--success-color)', background: 'rgba(16, 185, 129, 0.1)' }}>
            <TrendingUp size={22} />
          </div>
          <div className="metric-info">
            <h3>Mock Sessions</h3>
            <p>{stats?.totalInterviews || 0}</p>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrapper" style={{ color: 'var(--info-color)', background: 'rgba(59, 130, 246, 0.1)' }}>
            <MessageSquare size={22} />
          </div>
          <div className="metric-info">
            <h3>Active Target Role</h3>
            <p style={{ fontSize: '1rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
              {stats?.user?.targetRole || 'Software Candidate'}
            </p>
          </div>
        </div>
      </div>

      {/* Sessions History List */}
      <div className="history-section glass-panel">
        <div className="history-header">
          <h2>Interview History Log</h2>
          <span className="history-count-badge">{completedSessions.length} Completed</span>
        </div>

        <div className="history-list">
          {completedSessions.length === 0 ? (
            <div className="empty-history-state">
              <Calendar size={36} />
              <p>No completed interviews found in your history log yet. Start a session to track reports!</p>
            </div>
          ) : (
            completedSessions.map(session => {
              const isExpanded = expandedSessionId === session._id;
              const overall = session.overallFeedback || { score: 0, summary: 'No details' };
              const dateString = new Date(session.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div 
                  key={session._id} 
                  className={`history-card-row ${isExpanded ? 'row-expanded' : ''}`}
                  onClick={() => toggleExpandSession(session._id)}
                >
                  {/* Outer Row Brief Info */}
                  <div className="row-summary">
                    <div className="summary-left">
                      <div className="track-badge-icon">🤖</div>
                      <div className="track-details">
                        <h4>{session.track}</h4>
                        <span className="row-date-text">{dateString}</span>
                      </div>
                    </div>

                    <div className="summary-center">
                      <span className="diff-badge">{session.difficulty}</span>
                      <div className="row-dim-scores">
                        <span>Tech: <strong>{overall.technicalSkills || 0}</strong></span>
                        <span>Comm: <strong>{overall.communication || 0}</strong></span>
                        <span>Knowledge: <strong>{overall.knowledge || 0}</strong></span>
                      </div>
                    </div>

                    <div className="summary-right">
                      <div className={`row-score-badge ${getScoreColorClass(overall.score)}`}>
                        {overall.score}%
                      </div>
                      <button 
                        className="delete-row-btn"
                        onClick={(e) => handleDelete(session._id, e)}
                        title="Delete log permanently"
                      >
                        <Trash2 size={16} />
                      </button>
                      <span className="expand-indicator-icon">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="row-details-panel" onClick={(e) => e.stopPropagation()}>
                      <div className="overall-summary-block">
                        <h5>Recruiter Overall Feedback</h5>
                        <p>{overall.summary}</p>
                      </div>

                      <div className="questions-breakdown-title">
                        <h5>Detailed Questions Transcript ({session.questions.length})</h5>
                      </div>

                      <div className="transcript-list">
                        {session.questions.map((q, idx) => (
                          <div key={idx} className="transcript-item glass-panel">
                            <div className="transcript-q-header">
                              <span className="t-idx">Q{idx + 1}</span>
                              <p className="t-q-text">{q.questionText}</p>
                            </div>

                            <div className="transcript-answer">
                              <strong>Your Answer:</strong>
                              <p className="t-ans-text">{q.answerText || 'No response recorded.'}</p>
                            </div>

                            {q.feedback && (
                              <div className="transcript-feedback">
                                <div className="tf-header">
                                  <span className="tf-score-val">AI Grade: {q.feedback.score}/100</span>
                                </div>
                                <div className="tf-grids">
                                  <div className="tf-grid-col">
                                    <h6><CheckCircle size={12} style={{ color: 'var(--success-color)' }} /> Strengths</h6>
                                    <ul>
                                      {q.feedback.strengths?.map((s, sIdx) => <li key={sIdx}>{s}</li>)}
                                    </ul>
                                  </div>
                                  <div className="tf-grid-col">
                                    <h6><AlertTriangle size={12} style={{ color: 'var(--error-color)' }} /> Gaps</h6>
                                    <ul>
                                      {q.feedback.weaknesses?.map((w, wIdx) => <li key={wIdx}>{w}</li>)}
                                    </ul>
                                  </div>
                                </div>
                                <div className="tf-model-answer">
                                  <h6><BookOpen size={12} style={{ color: 'var(--info-color)' }} /> Reference Guide</h6>
                                  <p>{q.feedback.sampleAnswer}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
