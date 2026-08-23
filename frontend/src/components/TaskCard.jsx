export default function TaskCard({ task, onStatusChange, onSubtopicToggle }) {
  const topic = task.topic || {};
  const subtopics = Array.isArray(topic.subtopics) ? topic.subtopics : [];
  const completed = Array.isArray(task.completedSubtopics) ? task.completedSubtopics : [];
  const estHours = (subtopics.length * 0.6).toFixed(1);
  const isDone = task.status === 'done';

  return (
    <div className={`task-card ${isDone ? 'task-done' : ''}`}>
      <div className="task-head">
        <h5>{topic.name || 'Untitled topic'}</h5>
        <span className={`task-status ${task.status}`}>{task.status}</span>
      </div>
      <p className="task-sub">
        {isDone ? 'Completed' : `${completed.length}/${subtopics.length} subtopics · ${estHours}h`}
      </p>

      {subtopics.length > 0 && (
        <ul className="subtopics-checklist">
          {subtopics.map((subtopic) => {
            const checked = completed.includes(subtopic);
            return (
              <li key={subtopic}>
                <label className="subtopic-checkbox-label">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onSubtopicToggle(task._id, subtopic, e.target.checked)}
                  />
                  <span className={checked ? 'subtopic-done' : ''}>{subtopic}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      <select
        value={task.status}
        onChange={(e) => onStatusChange(task._id, e.target.value)}
        className="task-select"
      >
        <option value="pending">Pending</option>
        <option value="done">Done</option>
        <option value="skipped">Skip</option>
      </select>
    </div>
  );
}