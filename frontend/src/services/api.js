export async function registerUser(formData) {
  const response = await fetch("/api/v1/users/register", { 
    method: "POST",  
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }
  return data;
}

export async function loginUser(credentials) {
  const response = await fetch("/api/v1/users/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  const text = await response.text();
  console.log("Login Status:", response.status);
  console.log("Login Response:", text);
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server returned ${response.status} instead of JSON`);
  }
  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }
  return data;
}

export async function createWorkspace(formData) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch("/api/v1/workspaces/", { 
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,  // Send JWT access token
    },
    body: formData,
  });
  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response:", text);
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server returned ${response.status}`);
  }
  if (!response.ok) {
    throw new Error(data.message || "Workspace creation failed");
  }
  return data;
}

export async function getWorkspaces() {
  let token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Access token not found. Please login again.");
  }
  let response = await fetch("/api/v1/workspaces/", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 401) {
    console.log("Access token expired. Refreshing token...");
    try {
      token = await refreshAccessToken();
      response = await fetch("/api/v1/workspaces/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      localStorage.removeItem("accessToken");
      throw new Error("Session expired. Please login again.");
    }
  }
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server returned ${response.status}`);
  }
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch workspaces");
  }
  return data;
}

export async function refreshAccessToken() {
  const response = await fetch("/api/v1/users/refresh-token", {
    method: "POST",
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Session expired");
  }
  localStorage.setItem("accessToken", data.data.accessToken);
  return data.data.accessToken;
}
 
export async function getWorkspaceById(id) {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Access token not found. Please login again.");
  }
  const response = await fetch(`/api/v1/workspaces/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server returned ${response.status}`);
  }
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch workspace");
  }
  return data;
}

export async function logoutUser() {
  const response = await fetch("/api/v1/users/logout", {
    method: "POST",
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Logout failed");
  }
  return data;
}

export async function generateSchedule(id) {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Access token not found. Please login again.");
  }
  const response = await fetch(`/api/v1/workspaces/${id}/schedule`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const text = await response.text();
  console.log("Schedule Status:", response.status);
  console.log("Schedule Response:", text);
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server returned ${response.status}`);
  }
  if (!response.ok) {
    throw new Error(data.message || "Failed to generate schedule");
  }
  return data;
}

export async function getTodayTasks(id) {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Access token not found. Please login again.");
  }
  const response = await fetch(`/api/v1/workspaces/${id}/today`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server returned ${response.status}`);
  }
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch today's tasks");
  }
  return data;
}

export async function updateTaskStatus(id, status) {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Access token not found. Please login again.");
  }
  const response = await fetch(`/api/v1/task/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: status,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update task status");
  }
  return data;
}

export async function getAllTasks(id) {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Access token not found. Please login again.");
  }
  const response = await fetch(`/api/v1/workspaces/${id}/all-tasks`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server returned ${response.status}`);
  }
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch all tasks");
  }
  return data;
}