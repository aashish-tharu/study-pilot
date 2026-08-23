import TaskCard from './TaskCard';

export default function TaskGrid({ tasks, onTaskUpdate, onSubtopicToggle, emptyMessage = 'No tasks for today' }) {
  if (!tasks || tasks.length === 0) {
    return <div className="empty-tasks">{emptyMessage}</div>;
  }

  return (
    <div className="task-grid">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onStatusChange={onTaskUpdate}
          onSubtopicToggle={onSubtopicToggle}
        />
      ))}
    </div>
  );
}