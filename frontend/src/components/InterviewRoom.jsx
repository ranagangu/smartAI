import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { 
  Play, 
  Mic, 
  MicOff, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Award,
  BookOpen,
  ChevronRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import './InterviewRoom.css';

const InterviewRoom = ({ setCurrentView }) => {
  const { startNewInterview, submitInterviewAnswer, completeInterviewSession } = useUser();

  // Session states: 'config' | 'loading_session' | 'active' | 'grading_answer' | 'finished'
  const [sessionState, setSessionState] = useState('config');
  const [track, setTrack] = useState('Frontend');
  const [difficulty, setDifficulty] = useState('Mid');

  const [activeSession, setActiveSession] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  
  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Result display state for current question
  const [questionFeedback, setQuestionFeedback] = useState(null);

  // Final interview evaluation report
  const [finalReport, setFinalReport] = useState(null);

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        if (finalTranscript) {
          setAnswer(prev => prev + finalTranscript);
        }
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleStartSession = async () => {
    setSessionState('loading_session');
    try {
      const session = await startNewInterview(track, difficulty);
      setActiveSession(session);
      setCurrentQuestionIdx(0);
      setAnswer('');
      setQuestionFeedback(null);
      setFinalReport(null);
      setSessionState('active');
    } catch (err) {
      console.error(err);
      alert('Could not start mock interview. Check backend connection.');
      setSessionState('config');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      alert('Please enter or dictate an answer first.');
      return;
    }

    // Stop recording if active
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }

    setSessionState('grading_answer');

    try {
      const result = await submitInterviewAnswer(activeSession._id, currentQuestionIdx, answer);
      setQuestionFeedback(result.feedback);
    } catch (err) {
      console.error(err);
      alert('Error analyzing answer. Please try again.');
    } finally {
      setSessionState('active');
    }
  };

  const handleNextQuestion = () => {
    setAnswer('');
    setQuestionFeedback(null);
    setCurrentQuestionIdx(prev => prev + 1);
  };

  const handleFinishInterview = async () => {
    setSessionState('grading_answer'); // Reuse loading screen
    try {
      const result = await completeInterviewSession(activeSession._id);
      setFinalReport(result.overallFeedback);
      setSessionState('finished');
    } catch (err) {
      console.error(err);
      alert('Error finalizing interview summary.');
      setSessionState('active');
    }
  };

  const resetSimulator = () => {
    setActiveSession(null);
    setCurrentQuestionIdx(0);
    setAnswer('');
    setQuestionFeedback(null);
    setFinalReport(null);
    setSessionState('config');
  };

  return (
    <div className="interview-room-container">
      {/* 1. CONFIGURATOR STATE */}
      {sessionState === 'config' && (
        <div className="config-card glass-panel">
          <div className="config-header">
            <h2 className="gradient-text">Setup Mock Session</h2>
            <p>Customize your AI interviewer parameters. The model will design 5 questions based on your selections and saved profile details.</p>
          </div>

          <div className="config-form">
            <div className="form-group">
              <label>Interview Track</label>
              <div className="track-options">
                {['Frontend', 'Backend', 'System Design', 'Behavioral'].map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`option-btn ${track === t ? 'active' : ''}`}
                    onClick={() => setTrack(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Experience Level</label>
              <div className="difficulty-options">
                {['Junior', 'Mid', 'Senior'].map(d => (
                  <button
                    key={d}
                    type="button"
                    className={`option-btn ${difficulty === d ? 'active' : ''}`}
                    onClick={() => setDifficulty(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary start-btn" onClick={handleStartSession}>
              <Play size={18} />
              <span>Begin Simulation</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. LOADING STATE */}
      {(sessionState === 'loading_session' || sessionState === 'grading_answer') && (
        <div className="loading-card glass-panel">
          <div className="pulsing-brain">🧠</div>
          <h3>
            {sessionState === 'loading_session' 
              ? 'Gemini AI is designing interview questions...' 
              : 'Analyzing your responses and generating feedback...'}
          </h3>
          <p>This may take a moment to evaluate logic, clarity, and keyword metrics.</p>
          <div className="progress-bar-loading">
            <div className="progress-fill-loading"></div>
          </div>
        </div>
      )}

      {/* 3. ACTIVE INTERVIEW ROOM */}
      {sessionState === 'active' && activeSession && (
        <div className="active-interview-layout">
          {/* Interviewer Panel */}
          <div className="interviewer-card glass-panel">
            <div className="avatar-section">
              <div className={`avatar-pulse-ring ${isListening ? 'active-speaking' : ''}`}>
                <div className="avatar-face">🤖</div>
              </div>
              <span className="interviewer-name">Gemini AI Recruiter</span>
              <span className="session-progress-tag">
                Question {currentQuestionIdx + 1} of {activeSession.questions.length}
              </span>
            </div>

            <div className="question-bubble">
              <p className="question-text">
                {activeSession.questions[currentQuestionIdx]?.questionText}
              </p>
            </div>

            {isListening && (
              <div className="voice-wave">
                <span className="voice-bar"></span>
                <span className="voice-bar"></span>
                <span className="voice-bar"></span>
                <span className="voice-bar"></span>
                <span className="voice-bar"></span>
                <span className="voice-bar"></span>
                <span className="voice-bar"></span>
                <span className="voice-bar"></span>
              </div>
            )}
          </div>

          {/* Answer Panel */}
          <div className="answer-section">
            {!questionFeedback ? (
              // ANSWER INPUT MODE
              <div className="input-card glass-panel">
                <div className="input-header">
                  <h3>Your Response</h3>
                  <span className="sub-text">Speak or type your explanation details clearly.</span>
                </div>
                
                <textarea
                  className="answer-textarea"
                  placeholder="Type your explanation here, or click the microphone button to dictate using speech-to-text..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />

                <div className="input-actions">
                  <button 
                    className={`btn ${isListening ? 'btn-danger pulse-recording' : 'btn-secondary'}`}
                    onClick={toggleListening}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    <span>{isListening ? 'Stop Mic' : 'Speak Answer'}</span>
                  </button>

                  <button className="btn btn-primary submit-ans-btn" onClick={handleSubmitAnswer}>
                    <Send size={18} />
                    <span>Submit & Analyze</span>
                  </button>
                </div>
              </div>
            ) : (
              // ANSWER EVALUATION FEEDBACK MODE
              <div className="feedback-card glass-panel">
                <div className="feedback-header-bar">
                  <div className="score-badge">
                    <span className="score-value">{questionFeedback.score}</span>
                    <span className="score-max">/100</span>
                  </div>
                  <div>
                    <h3>Question Evaluation</h3>
                    <p className="feedback-sub">Detailed breakdown of your response metrics.</p>
                  </div>
                </div>

                <div className="feedback-scroll-content">
                  <div className="feedback-section-block strengths-block">
                    <h4 className="section-title"><CheckCircle size={16} /> Key Strengths</h4>
                    <ul>
                      {questionFeedback.strengths?.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="feedback-section-block weaknesses-block">
                    <h4 className="section-title"><AlertTriangle size={16} /> Areas of Improvement</h4>
                    <ul>
                      {questionFeedback.weaknesses?.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="feedback-section-block suggestions-block">
                    <h4 className="section-title"><Sparkles size={16} /> Actionable Tips</h4>
                    <ul>
                      {questionFeedback.suggestions?.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="feedback-section-block model-answer-block">
                    <h4 className="section-title"><BookOpen size={16} /> Reference Answer Guide</h4>
                    <p className="model-text">{questionFeedback.sampleAnswer}</p>
                  </div>
                </div>

                <div className="feedback-navigation">
                  {currentQuestionIdx < activeSession.questions.length - 1 ? (
                    <button className="btn btn-primary next-q-btn" onClick={handleNextQuestion}>
                      <span>Next Question</span>
                      <ChevronRight size={18} />
                    </button>
                  ) : (
                    <button className="btn btn-success next-q-btn" onClick={handleFinishInterview}>
                      <span>Complete Session</span>
                      <Award size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. FINISHED EVALUATION REPORT */}
      {sessionState === 'finished' && finalReport && (
        <div className="report-card glass-panel">
          <div className="report-header">
            <div className="report-celebration">🏆</div>
            <h2 className="gradient-text">Interview Performance Scorecard</h2>
            <p>You completed a {difficulty} {track} interview simulation.</p>
          </div>

          <div className="report-main-score">
            <span className="big-score">{finalReport.score}</span>
            <span className="total-cap">Overall Score</span>
          </div>

          <div className="report-summary-block">
            <h3>Recruiter Feedback Summary</h3>
            <p>{finalReport.summary}</p>
          </div>

          <div className="report-dimensions">
            {[
              { label: 'Technical & Logic Accuracy', val: finalReport.technicalSkills, color: 'var(--accent-primary)' },
              { label: 'Communication & Delivery', val: finalReport.communication, color: 'var(--accent-secondary)' },
              { label: 'Knowledge Depth', val: finalReport.knowledge, color: 'var(--info-color)' },
              { label: 'Tone & Confidence', val: finalReport.confidence, color: 'var(--success-color)' }
            ].map((d, i) => (
              <div key={i} className="dimension-bar-row">
                <div className="dimension-bar-labels">
                  <span>{d.label}</span>
                  <strong>{d.val}%</strong>
                </div>
                <div className="dimension-bar-track">
                  <div 
                    className="dimension-bar-fill" 
                    style={{ width: `${d.val}%`, backgroundColor: d.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="report-actions">
            <button className="btn btn-secondary" onClick={resetSimulator}>
              <RotateCcw size={18} />
              <span>Practice Again</span>
            </button>
            <button className="btn btn-primary" onClick={() => setCurrentView('dashboard')}>
              <TrendingUp size={18} />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewRoom;
