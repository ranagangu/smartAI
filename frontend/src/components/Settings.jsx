import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Save, Key, ShieldCheck, User, FileText, CheckCircle2 } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const { user, updateProfile } = useUser();

  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Mid Level');
  const [resumeText, setResumeText] = useState('');
  const [openrouterKey, setOpenrouterKey] = useState('');
  
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state with Context user when loaded
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setTargetRole(user.targetRole || '');
      setExperienceLevel(user.experienceLevel || 'Mid Level');
      setResumeText(user.resumeText || '');
      setOpenrouterKey(user.openrouterKey || '');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name,
        targetRole,
        experienceLevel,
        resumeText,
        openrouterKey
      });
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Error saving profile settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="settings-container">
      {/* SUCCESS ALERTS */}
      {showSaveSuccess && (
        <div className="save-success-alert glass-panel">
          <CheckCircle2 size={18} className="alert-check-icon" />
          <span>Profile configuration and AI credentials saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="settings-form">
        {/* Core Candidate Profile */}
        <div className="settings-section-card glass-panel">
          <div className="section-title-wrapper">
            <User size={20} className="section-icon" />
            <div>
              <h3>Candidate Profile</h3>
              <p>Setup details that will customize your resume scope and learning roadmaps.</p>
            </div>
          </div>

          <div className="section-body">
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="fullname">Full Name</label>
                <input
                  type="text"
                  id="fullname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="target-role">Target Role</label>
                <input
                  type="text"
                  id="target-role"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Frontend Developer"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="experience">Experience Level</label>
              <select
                id="experience"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                <option value="Junior Level">Junior Level (0-2 years)</option>
                <option value="Mid Level">Mid Level (2-5 years)</option>
                <option value="Senior Level">Senior Level (5+ years)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resume Profile Details */}
        <div className="settings-section-card glass-panel">
          <div className="section-title-wrapper">
            <FileText size={20} className="section-icon" />
            <div>
              <h3>Resume Profile details</h3>
              <p>Paste text summaries of your work history, skills, and projects. AI uses this context to design targeted interview queries.</p>
            </div>
          </div>

          <div className="section-body">
            <div className="form-field">
              <label htmlFor="resume">Resume Context Text</label>
              <textarea
                id="resume"
                className="resume-textarea"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your achievements, work experience details, languages, and technology stacks here..."
              />
            </div>
          </div>
        </div>

        {/* OpenRouter Credentials */}
        <div className="settings-section-card glass-panel">
          <div className="section-title-wrapper">
            <Key size={20} className="section-icon" />
            <div>
              <h3>OpenRouter AI Integration Setup</h3>
              <p>Manage API integrations that drive live mock simulations and evaluation reports.</p>
            </div>
          </div>

          <div className="section-body">
            <div className="api-notice-box">
              <ShieldCheck size={18} className="notice-shield" />
              <p>
                <strong>Security Notice:</strong> Your keys are saved securely in your backend database setup. An API key is required to perform mock interviews and evaluate answers.
              </p>
            </div>

            <div className="form-field">
              <label htmlFor="openrouter-key">OpenRouter API Key</label>
              <input
                type="password"
                id="openrouter-key"
                value={openrouterKey}
                onChange={(e) => setOpenrouterKey(e.target.value)}
                placeholder="Enter OpenRouter API key (sk-or-v1-...)"
              />
            </div>
          </div>
        </div>

        <div className="form-submit-wrapper">
          <button type="submit" className="btn btn-primary save-settings-btn" disabled={isSaving}>
            <Save size={18} />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
