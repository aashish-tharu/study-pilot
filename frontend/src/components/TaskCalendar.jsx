import { useMemo, useState } from 'react';
import TaskGrid from './TaskGrid';
import './TaskCalendar.css';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function dateKey(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

export default function TaskCalendar({ tasks, onTaskUpdate, onSubtopicToggle, onClose }) {
  const tasksByDate = useMemo(() => {
    const map = {};
    for (const task of tasks) {
      const rawDate = task.scheduleDay?.date;
      if (!rawDate) continue;
      const key = dateKey(rawDate);
      if (!map[key]) map[key] = [];
      map[key].push(task);
    }
    return map;
  }, [tasks]);

  const todayKey = dateKey(new Date());

  const initialKey = useMemo(() => {
    if (tasksByDate[todayKey]) return todayKey;
    const sortedKeys = Object.keys(tasksByDate).sort();
    return sortedKeys[0] || todayKey;
  }, [tasksByDate, todayKey]);

  const [initialYear, initialMonth] = initialKey.split('-').map(Number);
  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth - 1);
  const [selectedKey, setSelectedKey] = useState(initialKey);

  const goToMonth = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  };

  const gridCells = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ day, key });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const dayStatus = (key) => {
    const dayTasks = tasksByDate[key];
    if (!dayTasks || dayTasks.length === 0) return null;
    const allDone = dayTasks.every((t) => t.status === 'done');
    const isPast = key < todayKey;
    if (allDone) return 'done';
    if (isPast) return 'overdue';
    return 'pending';
  };

  const selectedTasks = tasksByDate[selectedKey] || [];
  const isSelectedToday = selectedKey === todayKey;

  return (
    <div className="calendar-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="calendar-modal-content">

        <div className="calendar-modal-header">
          <h3>Calendar</h3>
          <button type="button" className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="calendar-nav">
          <button type="button" className="calendar-nav-btn" onClick={() => goToMonth(-1)}>‹</button>
          <span className="calendar-month-label">{MONTH_LABELS[viewMonth]} {viewYear}</span>
          <button type="button" className="calendar-nav-btn" onClick={() => goToMonth(1)}>›</button>
        </div>

        <div className="calendar-grid">
          {DAY_LABELS.map((label) => (
            <div key={label} className="calendar-day-label">{label}</div>
          ))}

          {gridCells.map((cell, idx) => {
            if (!cell) return <div key={`blank-${idx}`} className="calendar-cell calendar-cell-blank"></div>;

            const status = dayStatus(cell.key);
            const isToday = cell.key === todayKey;
            const isSelected = cell.key === selectedKey;

            return (
              <button
                type="button"
                key={cell.key}
                className={[
                  'calendar-cell',
                  isToday ? 'is-today' : '',
                  isSelected ? 'is-selected' : '',
                  status ? 'has-tasks' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => setSelectedKey(cell.key)}
              >
                <span className="calendar-cell-number">{cell.day}</span>
                {status && <span className={`calendar-dot dot-${status}`}></span>}
              </button>
            );
          })}
        </div>

        <div className="calendar-selected-panel">
          <div className="calendar-selected-heading">
            <h4>{isSelectedToday ? "Today's tasks" : selectedKey}</h4>
            <span className="calendar-selected-count">{selectedTasks.length} task{selectedTasks.length === 1 ? '' : 's'}</span>
          </div>

          <TaskGrid
            tasks={selectedTasks}
            onTaskUpdate={onTaskUpdate}
            onSubtopicToggle={onSubtopicToggle}
            emptyMessage="No tasks scheduled for this day"
          />
        </div>

      </div>
    </div>
  );
}