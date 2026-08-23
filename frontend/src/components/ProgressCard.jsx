export default function ProgressCard({ progress }) {
  if (!progress) return null;

  const activeProgress = Math.round(progress.percentage || 0);
  const remaining = (progress.totalTasks || 0) - (progress.completedTasks || 0);

  return (
    <div className="progress-card">
      <div className="progress-header">
        <span className="mini-label dark">YOUR PROGRESS</span>
        <span className="progress-value">{activeProgress}%</span>
      </div>
      <div className="progress-bar">
        <span style={{ width: `${activeProgress}%` }}></span>
      </div>
      <div className="progress-stats">
        <div className="metric-box">
          <span className="metric-label">Completed</span>
          <strong>{progress.completedTasks || 0}</strong>
        </div>
        <div className="metric-box">
          <span className="metric-label">Total</span>
          <strong>{progress.totalTasks || 0}</strong>
        </div>
        <div className="metric-box">
          <span className="metric-label">Remaining</span>
          <strong>{remaining}</strong>
        </div>
      </div>
    </div>
  );
}