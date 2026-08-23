import { useState } from 'react';

export default function WorkspaceCreatorForm({ onSubmit, onClose, loading }) {
  const [name, setName] = useState('');
  const [daysToComplete, setDaysToComplete] = useState('');
  const [depthLevel, setDepthLevel] = useState('quick');
  const [file, setFile] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ name, daysToComplete, depthLevel, file });
  };

  return (
    <div className="workspace-creator-panel">
      <div className="creator-header">
        <button type="button" className="creator-back-btn" onClick={onClose}>←</button>
        <span className="creator-breadcrumb">DASHBOARD</span>
        <span className="creator-separator">›</span>
        <span className="creator-title">New workspace</span>
      </div>

      <form className="creator-body" onSubmit={handleSubmit}>
        <div className="creator-step">STEP 1 OF 2</div>
        <h3 className="creator-heading">Check in your syllabus</h3>

        <div className="creator-grid">
          <div className="creator-column">
            <label className="creator-label">Workspace name</label>
            <input
              type="text"
              placeholder="DBMS Semester 5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="creator-input"
              required
            />

            <label className="upload-box" htmlFor="workspace-syllabus">
              <span className="upload-icon">⤴</span>
              <span className="upload-title">{file ? file.name : 'Drop your syllabus here'}</span>
              <span className="upload-subtitle">
                {file ? 'File selected successfully' : 'PDF, DOCX, PNG or JPEG · up to 5MB'}
              </span>
            </label>
            <input
              id="workspace-syllabus"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="file-input-hidden"
            />
          </div>

          <div className="creator-column">
            <label className="creator-label">Days until exam</label>
            <input
              type="number"
              placeholder="14"
              value={daysToComplete}
              onChange={(e) => setDaysToComplete(e.target.value)}
              className="creator-input"
              min="1"
              required
            />

            <label className="creator-label">Study depth</label>
            <div className="depth-selector">
              {['quick', 'moderate', 'deep'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`depth-option ${depthLevel === option ? 'active' : ''}`}
                  onClick={() => setDepthLevel(option)}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>

            <div className="info-note">
              <span className="info-icon">i</span>
              Gemini reads your syllabus once and extracts topics with exam weightage.
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="extract-btn">
          {loading ? 'Processing...' : 'Extract topics'}
        </button>
      </form>
    </div>
  );
}