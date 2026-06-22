import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { 
  CheckCircle, 
  Circle, 
  BookOpen, 
  Code, 
  RefreshCw, 
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import './LearningPath.css';

const LearningPath = () => {
  const { learningPath, toggleModuleStatus, generateNewLearningPath } = useUser();
  
  // Custom regeneration form visibility state
  const [showGenForm, setShowGenForm] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Mid Level');
  const [isGenerating, setIsGenerating] = useState(false);

  const modules = learningPath?.modules || [];
  const completedCount = modules.filter(m => m.status === 'completed').length;
  const totalCount = modules.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggle = async (moduleId, currentStatus) => {
    await toggleModuleStatus(moduleId, currentStatus);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!targetRole.trim()) {
      alert('Please enter a target job title.');
      return;
    }

    setIsGenerating(true);
    try {
      await generateNewLearningPath(targetRole, experienceLevel);
      setShowGenForm(false);
      setTargetRole('');
    } catch (err) {
      console.error(err);
      alert('Error generating custom learning path.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="learning-path-container">
      {/* HEADER SECTION */}
      <div className="learning-header glass-panel">
        <div className="header-info">
          <h2>Personalized Roadmap</h2>
          <p className="roadmap-role-tag">Active: {learningPath?.role || 'Full Stack Engineer'}</p>
        </div>

        <div className="progress-section-roadmap">
          <div className="progress-stats">
            <span>{progressPercent}% Complete</span>
            <span>({completedCount}/{totalCount} Modules)</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <button 
          className="btn btn-secondary regenerate-trigger-btn"
          onClick={() => setShowGenForm(!showGenForm)}
        >
          <RefreshCw size={16} />
          <span>New AI Roadmap</span>
        </button>
      </div>

      {/* REGENERATE PATH FORM */}
      {showGenForm && (
        <div className="generate-form-card glass-panel">
          <div className="form-title">
            <Sparkles size={18} className="gradient-text" />
            <h3>Generate Custom AI Learning Path</h3>
          </div>
          
          {isGenerating ? (
            <div className="generating-state">
              <RefreshCw size={24} className="spin-icon" />
              <p>Gemini is tailoring an interview-prep curriculum for your career level...</p>
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="roadmap-input-form">
              <div className="form-fields">
                <div className="field-group">
                  <label htmlFor="target-role">Target Job Title</label>
                  <input
                    type="text"
                    id="target-role"
                    placeholder="e.g. Staff Backend Engineer, iOS Developer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    required
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="target-level">Experience Level</label>
                  <select
                    id="target-level"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                  >
                    <option value="Junior Level">Junior Level (0-2 years)</option>
                    <option value="Mid Level">Mid Level (2-5 years)</option>
                    <option value="Senior Level">Senior Level (5+ years)</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowGenForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <span>Generate Path</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* MODULES TIMELINE LIST */}
      <div className="roadmap-timeline">
        {modules.length === 0 ? (
          <div className="empty-roadmap glass-panel">
            <p>No active learning modules found. Try generating a new roadmap above!</p>
          </div>
        ) : (
          modules.map((mod, index) => {
            const isCompleted = mod.status === 'completed';
            return (
              <div key={mod.id} className={`timeline-node ${isCompleted ? 'node-completed' : ''}`}>
                {/* Visual side index column */}
                <div className="node-indicator-col">
                  <button 
                    className="completion-toggle-btn"
                    onClick={() => handleToggle(mod.id, mod.status)}
                    title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                  >
                    {isCompleted ? (
                      <CheckCircle size={28} className="checked-icon" />
                    ) : (
                      <Circle size={28} className="unchecked-icon" />
                    )}
                  </button>
                  {index < modules.length - 1 && <div className="timeline-connector-line"></div>}
                </div>

                {/* Node details */}
                <div className="node-content-card glass-panel">
                  <div className="node-header">
                    <span className="step-number-tag">Module {index + 1}</span>
                    <h3 className="node-title">{mod.title}</h3>
                  </div>

                  <p className="node-desc">{mod.description}</p>

                  <div className="node-resources-exercises">
                    {/* Topics to Learn */}
                    <div className="items-list-block">
                      <h4>
                        <BookOpen size={14} />
                        <span>Core Topics to Study</span>
                      </h4>
                      <ul>
                        {mod.resources?.map((res, rIdx) => (
                          <li key={rIdx}>{res}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Practical Tasks */}
                    <div className="items-list-block">
                      <h4>
                        <Code size={14} />
                        <span>Practice Exercises</span>
                      </h4>
                      <ul>
                        {mod.exercises?.map((ex, eIdx) => (
                          <li key={eIdx}>{ex}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LearningPath;
