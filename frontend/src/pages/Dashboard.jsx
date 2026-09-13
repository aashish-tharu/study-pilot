import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createWorkspace, getWorkspaces, logoutUser } from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);

  const [formData, setFormData] = useState({
  name: "",
  daysToComplete: "",
  depthLevel: "",
  file: null,
});

async function loadWorkspaces() {
  try {
    const response = await getWorkspaces();

    console.log("Workspaces:", response);

    setWorkspaces(response.data);
  } catch (error) {
    console.log(error);
  }
}

async function handleLogout() {
  try {
    await logoutUser();
    localStorage.removeItem("accessToken");
    navigate("/login");

  } catch (error) {
    console.log(error);
    alert(error.message);
  }
}

useEffect(() => {
  loadWorkspaces();
}, []);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }
  function handleOpenWorkspace(id) {
  navigate(`/workspace/${id}`);
}

 async function handleSubmit(e) {
  e.preventDefault();

  try {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("daysToComplete", formData.daysToComplete);
    data.append("depthLevel", formData.depthLevel);
    data.append("syllabus", formData.file);

    const response = await createWorkspace(data);

    console.log(response);
    await loadWorkspaces();
    alert("Workspace created successfully");

    setShowForm(false);

    setFormData({
      name: "",
      daysToComplete: "",
      depthLevel: "",
      file: null,
    });
  } catch (error) {
    alert(error.message);
  }
}

return (
  <div className="dashboard">

<nav className="navbar">

  <h2 className="logo">
     Study Pilot
  </h2>

  <div className="nav-right">

    <span className="user-badge">
      Student
    </span>

    <button
      className="logout-button"
      onClick={handleLogout}
    >
      Logout
    </button>

  </div>

</nav>

    <main className="dashboard-container">

      <div className="welcome-section">

        <div>
          <p className="welcome-small">
            Welcome back
          </p>

          <h1>
            Study smarter, not harder.
          </h1>

          <p className="welcome-description">
            Plan your studies, organize your syllabus,
            and keep track of your learning journey.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          + Create Workspace
        </button>

      </div>

      {showForm && (
        <div className="workspace-form-card">

          <div className="form-header">

            <div>
              <h2>Create New Workspace</h2>

              <p>
                Add your syllabus and create a study workspace.
              </p>
            </div>

            <button
              className="close-button"
              type="button"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>

          </div>


          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label>
                Workspace Name
              </label>

              <input
                name="name"
                placeholder="e.g. Data Structures"
                value={formData.name}
                onChange={handleChange}
                required
              />

            </div>

            <div className="form-row">

              <div className="form-group">

                <label>
                  Study Days
                </label>

                <input
                  name="daysToComplete"
                  type="number"
                  placeholder="e.g. 10"
                  value={formData.daysToComplete}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Depth Level
                </label>

                <select
                  name="depthLevel"
                  value={formData.depthLevel}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Depth Level
                  </option>

                  <option value="quick">
                    Quick
                  </option>

                  <option value="moderate">
                    Moderate
                  </option>

                  <option value="deep">
                    Deep
                  </option>

                </select>

              </div>

            </div>

            <div className="form-group">

              <label>
                Syllabus File
              </label>

              <input
                name="file"
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    file: e.target.files[0],
                  })
                }
                required
              />

              <small>
                Upload PDF, TXT, DOC or DOCX file.
              </small>

            </div>

            <div className="form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                Create Workspace
              </button>

            </div>

          </form>

        </div>
      )}

      <div className="workspaces-section">

        <div className="section-heading">

          <div>
            <h2>
              My Workspaces
            </h2>

            <p>
              Your study plans and learning spaces.
            </p>
          </div>

          <span className="workspace-count">
            {workspaces.length} Workspace
            {workspaces.length !== 1 ? "s" : ""}
          </span>

        </div>


        {workspaces.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              📚
            </div>

            <h3>
              No workspaces yet
            </h3>

            <p>
              Create your first workspace to start
              planning your studies.
            </p>

            <button
              className="primary-button"
              onClick={() => setShowForm(true)}
            >
              + Create Workspace
            </button>

          </div>

        ) : (

          <div className="workspace-grid">

            {workspaces.map((workspace) => (

              <div
                className="workspace-card"
                key={workspace._id}
                onClick={() =>
                  handleOpenWorkspace(workspace._id)
                }
              >

                <div className="workspace-card-top">

                  <div className="workspace-icon">
                    📖
                  </div>

                  <span
                    className={`status-badge ${workspace.status}`}
                  >
                    {workspace.status}
                  </span>

                </div>


                <h3>
                  {workspace.name}
                </h3>

                <p className="workspace-subtitle">
                  Your personalized study workspace
                </p>


                <div className="workspace-info">

                  <div>
                    <span>
                      Study Days
                    </span>

                    <strong>
                      {workspace.daysToComplete}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Depth
                    </span>

                    <strong>
                      {workspace.depthLevel}
                    </strong>
                  </div>

                </div>


                <div className="open-workspace">
                  Open Workspace →
                </div>

              </div>

            ))}

          </div>

        )}

      </div>
      
    </main>

  </div>
);

  
}

export default Dashboard;
