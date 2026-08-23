import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  createWorkspace,
  generateSchedule,
  getTodayTasks,
  getWorkspaceDetails,
  getWorkspaceProgress,
  getWorkspaces,
  updatePassword,
  updateTaskStatus,
  updateSubtopicStatus,
  getAllTasks,
} from '../services/api';

import DashboardHeader from '../components/DashboardHeader';
import WorkspaceCreatorForm from '../components/WorkspaceCreatorForm';
import WorkspaceListPanel from '../components/WorkspaceListPanel';
import ProgressCard from '../components/ProgressCard';
import TaskGrid from '../components/TaskGrid';
import AllTasksModal from '../components/AllTasksModal';
import TaskCalendar from '../components/TaskCalendar';

import './DashboardPage.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showWorkspaceList, setShowWorkspaceList] = useState(false);
  const [lastCreatedWorkspace, setLastCreatedWorkspace] = useState(null);
  const [scheduling, setScheduling] = useState(false);
  const [theme, setTheme] = useState('dark');

  
  const [tasksView, setTasksView] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [allTasksLoading, setAllTasksLoading] = useState(false);

  const showMessage = (type, text) => setMessage({ type, text });

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const handleChangePassword = async (oldPassword, newPassword) => {
    const payload = await updatePassword(oldPassword, newPassword);
    showMessage('success', payload.message || 'Password updated successfully');
  };

  const selectWorkspace = async (workspaceId) => {
    try {
      const [detailsPayload, progressPayload, tasksPayload] = await Promise.all([
        getWorkspaceDetails(workspaceId),
        getWorkspaceProgress(workspaceId),
        getTodayTasks(workspaceId),
      ]);

      setSelectedWorkspace(detailsPayload.data?.workspace || null);
      setProgress(progressPayload.data || null);
      setTasks(tasksPayload.data?.tasks || []);
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const refreshWorkspaces = async () => {
    const payload = await getWorkspaces();
    const workspaceList = payload.data || [];
    setWorkspaces(workspaceList);

    if (!workspaceList.length) {
      setSelectedWorkspace(null);
      setTasks([]);
      setProgress(null);
      return;
    }

    if (!selectedWorkspace) {
      await selectWorkspace(workspaceList[0]._id);
    }
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        await refreshWorkspaces();
      } catch (error) {
        showMessage('error', error.message);
      } finally {
        setLoading(false);
      }
    }
    load();
    
  }, []);

  const handleCreateWorkspace = async ({ name, daysToComplete, depthLevel, file }) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('daysToComplete', daysToComplete);
      formData.append('depthLevel', depthLevel);
      if (file) formData.append('syllabus', file);

      const payload = await createWorkspace(formData);
      showMessage('success', payload.message || 'Workspace created');
      setLastCreatedWorkspace(payload.data || null);
      setShowCreateForm(false);
      await refreshWorkspaces();

      if (payload.data?._id) {
        await selectWorkspace(payload.data._id);
      }
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleCreatedWorkspace = async (workspaceId) => {
    if (!workspaceId) return;
    setScheduling(true);
    try {
      const payload = await generateSchedule(workspaceId);
      showMessage('success', payload.message || 'Schedule generated');
      await selectWorkspace(workspaceId);
      setLastCreatedWorkspace(null);
      setShowWorkspaceList(false);
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setScheduling(false);
    }
  };

  const handleGenerateSchedule = async () => {
    if (!selectedWorkspace?._id) return;
    setLoading(true);
    try {
      const payload = await generateSchedule(selectedWorkspace._id);
      showMessage('success', payload.message || 'Schedule generated');
      await selectWorkspace(selectedWorkspace._id);
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId, status) => {
    setLoading(true);
    try {
      await updateTaskStatus(taskId, status);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status } : t)));
      setAllTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status } : t)));
      showMessage('success', 'Task updated');
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubtopicToggle = async (taskId, subtopic, completed) => {
   
    const applyLocal = (list) =>
      list.map((t) => {
        if (t._id !== taskId) return t;
        const current = Array.isArray(t.completedSubtopics) ? t.completedSubtopics : [];
        const next = completed
          ? [...new Set([...current, subtopic])]
          : current.filter((s) => s !== subtopic);
        return { ...t, completedSubtopics: next };
      });

    setTasks(applyLocal);
    setAllTasks(applyLocal);

    try {
      await updateSubtopicStatus(taskId, subtopic, completed);
    } catch (error) {
     
      const revert = (list) =>
        list.map((t) => {
          if (t._id !== taskId) return t;
          const current = Array.isArray(t.completedSubtopics) ? t.completedSubtopics : [];
          const reverted = completed
            ? current.filter((s) => s !== subtopic)
            : [...new Set([...current, subtopic])];
          return { ...t, completedSubtopics: reverted };
        });
      setTasks(revert);
      setAllTasks(revert);
      showMessage('error', error.message);
    }
  };

  const openTasksView = async (mode) => {
    if (!selectedWorkspace?._id) return;
    setAllTasksLoading(true);
    try {
      const payload = await getAllTasks(selectedWorkspace._id);
      setAllTasks(payload.data?.tasks || []);
      setTasksView(mode);
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setAllTasksLoading(false);
    }
  };

  const activeProgress = progress ? Math.round(progress.percentage || 0) : 0;

  return (
    <div className={`dashboard-shell theme-${theme}`}>
      <div className="dashboard-board">
        <DashboardHeader
          user={user}
          workspaceCount={workspaces.length}
          todayTaskCount={tasks.length}
          activeProgress={activeProgress}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          onLogout={handleLogout}
          onChangePassword={handleChangePassword}
        />

        <div className="dashboard-body">
          <div className="eyebrow">DEPARTURES</div>

          <div className="board-grid">
            <button
              type="button"
              className="board-card board-card-accent"
              onClick={() => { setShowWorkspaceList(false); setShowCreateForm((c) => !c); }}
            >
              <span className="card-edge left"></span>
              <span className="card-edge right"></span>
              <span className="card-icon">＋</span>
              <div className="card-kicker">NEW BOARDING PASS</div>
              <h3>Create workspace</h3>
              <p>Upload a syllabus to start</p>
            </button>

            <button
              type="button"
              className="board-card"
              onClick={() => { setShowCreateForm(false); setShowWorkspaceList((c) => !c); }}
            >
              <span className="card-edge left"></span>
              <span className="card-edge right"></span>
              <span className="card-icon secondary">▦</span>
              <div className="card-kicker">YOUR FLIGHTS</div>
              <h3>My workspaces</h3>
              <p>{workspaces.length} courses in progress</p>
            </button>
          </div>

          {showCreateForm && (
            <WorkspaceCreatorForm
              onSubmit={handleCreateWorkspace}
              onClose={() => setShowCreateForm(false)}
              loading={loading}
            />
          )}

          {lastCreatedWorkspace && (
            <div className="schedule-result-panel">
              <div className="schedule-info">
                <strong>{lastCreatedWorkspace.name}</strong>
                <div className="schedule-sub">Workspace ready — schedule your study plan</div>
              </div>
              <button
                type="button"
                className="primary-btn"
                onClick={() => handleScheduleCreatedWorkspace(lastCreatedWorkspace._id)}
                disabled={scheduling}
              >
                {scheduling ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
          )}

          {showWorkspaceList && (
            <WorkspaceListPanel
              workspaces={workspaces}
              selectedWorkspaceId={selectedWorkspace?._id}
              onSelect={selectWorkspace}
            />
          )}

          {message.text && (
            <div className={`message-banner ${message.type}`}>
              {message.text}
              <button type="button" onClick={() => setMessage({ type: '', text: '' })} className="message-close">×</button>
            </div>
          )}

          {selectedWorkspace ? (
            <div className="workspace-panel">
              <div className="workspace-panel-header">
                <h3>{selectedWorkspace.name}</h3>
                <div className="header-button-group">
                  <button type="button" className="primary-btn" onClick={handleGenerateSchedule} disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Schedule'}
                  </button>
                  <button type="button" className="primary-btn" onClick={() => openTasksView('calendar')} disabled={allTasksLoading}>
                    {allTasksLoading ? 'Loading...' : 'View Calendar'}
                  </button>
                  <button type="button" className="primary-btn" onClick={() => openTasksView('list')} disabled={allTasksLoading}>
                    {allTasksLoading ? 'Loading...' : 'View All Tasks'}
                  </button>
                </div>
              </div>

              <ProgressCard progress={progress} />

              <div className="task-section">
                <h4>Today's Tasks</h4>
                <TaskGrid tasks={tasks} onTaskUpdate={handleTaskUpdate} onSubtopicToggle={handleSubtopicToggle} />
              </div>
            </div>
          ) : (
            <div className="empty-state-panel">
              <div className="empty-emoji">📚</div>
              <h3>No workspace selected</h3>
              <p>Select or create a workspace to get started</p>
            </div>
          )}
        </div>
      </div>

      {tasksView === 'list' && (
        <AllTasksModal
          tasks={allTasks}
          onTaskUpdate={handleTaskUpdate}
          onSubtopicToggle={handleSubtopicToggle}
          onClose={() => setTasksView(null)}
        />
      )}
      {tasksView === 'calendar' && (
        <TaskCalendar
          tasks={allTasks}
          onTaskUpdate={handleTaskUpdate}
          onSubtopicToggle={handleSubtopicToggle}
          onClose={() => setTasksView(null)}
        />
      )}
    </div>
  );
}