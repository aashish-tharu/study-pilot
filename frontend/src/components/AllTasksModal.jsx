const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#ef4444', bgColor: '#fee2e2' },
  done: { label: 'Completed', color: '#22c55e', bgColor: '#dcfce7' },
  skipped: { label: 'Skipped', color: '#eab308', bgColor: '#fef3c7' },
};

export default function AllTasksModal({ tasks, onTaskUpdate, onSubtopicToggle, onClose }) {
  return (
    <div className="all-tasks-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h3>All Tasks</h3>
          <button type="button" className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {tasks.length === 0 ? (
            <div className="empty-tasks">No tasks in this workspace</div>
          ) : (
            <div className="all-tasks-container">
              {['pending', 'done', 'skipped'].map((status) => {
                const statusTasks = tasks.filter((t) => t.status === status);
                if (statusTasks.length === 0) return null;

                const config = STATUS_CONFIG[status];

                return (
                  <div key={status} className="status-group">
                    <div className="status-header" style={{ borderLeftColor: config.color }}>
                      <span className="status-badge" style={{ backgroundColor: config.bgColor, color: config.color }}>
                        {config.label}
                      </span>
                      <span className="status-count">{statusTasks.length} tasks</span>
                    </div>
                    <div className="status-tasks">
                      {statusTasks.map((task) => {
                        const topic = task.topic || {};
                        const subtopics = Array.isArray(topic.subtopics) ? topic.subtopics : [];
                        const completed = Array.isArray(task.completedSubtopics) ? task.completedSubtopics : [];

                        return (
                          <div key={task._id} className="task-item" style={{ borderLeftColor: config.color }}>
                            <div className="task-item-content">
                              <div className="task-item-head">
                                <h5>{topic.name || 'Untitled topic'}</h5>
                                <span className="task-item-meta">{completed.length}/{subtopics.length} subtopics</span>
                              </div>
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
                            </div>
                            <select
                              value={task.status}
                              onChange={(e) => onTaskUpdate(task._id, e.target.value)}
                              className="task-select"
                            >
                              <option value="pending">Pending</option>
                              <option value="done">Done</option>
                              <option value="skipped">Skip</option>
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}