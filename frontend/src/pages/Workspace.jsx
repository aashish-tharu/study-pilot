import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getWorkspaceById, generateSchedule, getTodayTasks, updateTaskStatus, getAllTasks } from "../services/api";
import "./Workspace.css";

function Workspace() {
  const { id } = useParams(); 
  const [workspace, setWorkspace] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);

useEffect(() => {
  async function loadWorkspace() {
    try {
      const response = await getWorkspaceById(id);
      console.log("Workspace Details:", response);
      setWorkspace(response.data.workspace);
      setTopics(response.data.topics);

      const todayResponse = await getTodayTasks(id);

      console.log("Today's Tasks:", todayResponse);

      setTodayTasks(todayResponse.data.tasks);

      if (response.data.workspace.status === "scheduled") {
        const allTasksResponse = await getAllTasks(id);

        console.log("All Saved Tasks:", allTasksResponse);

        const allTasks = allTasksResponse.data.tasks;
        const workspaceTopics = response.data.topics;

        const groupedSchedule = {};

        allTasks.forEach((task) => {
          const dateKey = new Date(task.scheduleDay.date)
            .toISOString()
            .split("T")[0];

          if (!groupedSchedule[dateKey]) {
            groupedSchedule[dateKey] = {
              date: task.scheduleDay.date,
              tasks: [],
              totalHours: 0,
            };
          }

          const topic = workspaceTopics.find(
            (item) => item._id === task.topic._id
          );

          let estimatedHours = 0;

          if (topic) {
            const depthConfig = {
              quick: {
                baseHours: 1,
                hoursPerSubtopic: 0.25,
                weightMultiplier: 1,
              },
              moderate: {
                baseHours: 1.75,
                hoursPerSubtopic: 0.4,
                weightMultiplier: 1.5,
              },
              deep: {
                baseHours: 2.5,
                hoursPerSubtopic: 0.6,
                weightMultiplier: 2,
              },
            };

            const config =
            depthConfig[response.data.workspace.depthLevel];

            const subtopicCount = topic.subtopics?.length || 0;

            estimatedHours =
              config.baseHours +
              subtopicCount * config.hoursPerSubtopic +
              (topic.weightagePercent / 100) *
                config.weightMultiplier;
            estimatedHours = Math.round(estimatedHours * 10) / 10;
          }

          groupedSchedule[dateKey].tasks.push({
            name: task.topic.name,
            estimatedHours: estimatedHours,
          });

          groupedSchedule[dateKey].totalHours += estimatedHours;
        });

        const savedSchedule = Object.values(groupedSchedule)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map((day) => ({
            ...day,
            totalHours: Math.round(day.totalHours * 10) / 10,
          }));

        setSchedule(savedSchedule);
      }
    } catch (error) {
      console.log(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }
  loadWorkspace();
}, [id]);

async function handleGenerateSchedule() {
  try {
    const response = await generateSchedule(id);
    console.log("Generated Schedule:", response);

    setSchedule(response.data.scheduleDays);

    setWorkspace((currentWorkspace) => ({
      ...currentWorkspace,
      status: "scheduled"
    }));

    const todayResponse = await getTodayTasks(id);
    console.log("Today's Tasks after schedule:", todayResponse);

    setTodayTasks(todayResponse.data.tasks);

    alert("Schedule generated successfully");
  } catch (error) {
    console.log(error);
    alert(error.message);
  }
}

async function handleTaskStatus(taskId, status) {
  try {
    const response = await updateTaskStatus(taskId, status);

    console.log("Updated Task:", response);
    if (status === "done" || status === "skipped") {
      setTodayTasks((currentTasks) =>
        currentTasks.filter((task) => task._id !== taskId)
      );
    }
  } catch (error) {
    console.log(error);
    alert(error.message);
  }

}
  if (loading) {
    return <h2>Loading workspace...</h2>;
  }

  if (!workspace) {
    return <h2>Workspace not found</h2>;
  }

 return (
  <div className="workspace-page">
    <div className="workspace-header">

      <div>
        <p className="workspace-label">
          Study Workspace
        </p>

        <h1>{workspace.name}</h1>

        <p className="workspace-status">
  Status: <strong>{workspace.status}</strong>
</p>

<button
  onClick={handleGenerateSchedule}
  disabled={workspace.status === "scheduled"}
>
  {workspace.status === "scheduled"
    ? "Schedule Generated"
    : "Generate Schedule"}
</button>
      </div>

    </div>

    <div className="workspace-info-card">

      <div className="info-item">
        <span>Study Days</span>
        <strong>{workspace.daysToComplete}</strong>
      </div>

      <div className="info-item">
        <span>Depth Level</span>
        <strong>{workspace.depthLevel}</strong>
      </div>

      <div className="info-item">
        <span>Status</span>
        <strong>{workspace.status}</strong>
      </div>

    </div>

    <div className="topics-section">

      <h2>Topics</h2>

      <p className="topics-description">
        Topics extracted from your syllabus.
      </p>


      {topics.length === 0 ? (

        <div className="no-topics">
          <p>No topics found.</p>
        </div>

      ) : (

        <div className="topics-list">

          {topics.map((topic, index) => (

            <div
              className="topic-card"
              key={topic._id}
            >

              <div className="topic-number">
                {index + 1}
              </div>

              <div className="topic-content">

                <h3>
                  {topic.name}
                </h3>

                <p>
                  Weightage: {topic.weightagePercent}%
                </p>


                <h4>
                  Subtopics
                </h4>

                {topic.subtopics.length === 0 ? (

                  <p className="no-subtopics">
                    No subtopics available.
                  </p>

                ) : (

                  <ul>
                    {topic.subtopics.map(
                      (subtopic, index) => (
                        <li key={index}>
                          {subtopic}
                        </li>
                      )
                    )}
                  </ul>

                )}

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

    <div className="today-tasks-section">

      <h2>Today's Tasks</h2>

      {todayTasks.length === 0 ? (

        <p>No tasks for today.</p>

      ) : (

        <div className="today-tasks-list">

          {todayTasks.map((task, index) => (

            <div
              className="today-task-card"
              key={task._id || index}
            >
              <span>
                {index + 1}.
              </span>

              <strong>
                {task.topic?.name}
              </strong>

              <span>
                Status: {task.status}
              </span>
              <button onClick={() => handleTaskStatus(task._id, "done")}
                > Done </button>
                <button onClick={() => handleTaskStatus(task._id, "skipped")}
                > Skip</button>

            </div>

          ))}

        </div>

      )}

    </div>

<div className="schedule-section">

  <h2>Study Schedule</h2>
  {schedule.length === 0 ? (
    <p>No schedule generated yet.</p>

  ) : (

    <div className="schedule-list">
      {schedule.map((day, index) => (

        <div
          className="schedule-card"
          key={index}
        >
          <h3>
            Day {index + 1}
          </h3>

          <p>
            Date: {new Date(day.date).toLocaleDateString()}
          </p>

          <p>
            Total Hours: {day.totalHours}
          </p>


          <h4>
            Tasks
          </h4>

          {day.tasks.map((task, taskIndex) => (

            <div
              className="schedule-task"
              key={taskIndex}
            >

              <strong>
                {task.name}
              </strong>
              
              <span>
                {task.estimatedHours} hours
              </span>

            </div>

          ))}

        </div>

      ))}

    </div>

  )}

</div>
  </div>
);
}

export default Workspace;