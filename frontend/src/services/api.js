const API_BASE = '/api/v1';

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set('Accept', 'application/json');
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed');
  }

  return payload;
}

export async function loginUser(credentials) {
  return request('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function registerUser(payload) {
  return request('/users/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function logoutUser() {
  return request('/users/logout', { method: 'POST' });
}

export async function updatePassword(oldPassword, newPassword) {
  return request('/users/updatepassword', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

export async function getCurrentUser() {
  return request('/users/getcurrentuser', { method: 'POST' });
}

export async function getWorkspaces() {
  return request('/workspaces', { method: 'GET' });
}

export async function createWorkspace(formData) {
  return request('/workspaces/', {
    method: 'POST',
    body: formData,
  });
}

export async function getWorkspaceDetails(workspaceId) {
  return request(`/workspaces/${workspaceId}`, { method: 'GET' });
}

export async function getWorkspaceProgress(workspaceId) {
  return request(`/workspaces/${workspaceId}/progress`, { method: 'GET' });
}

export async function getTodayTasks(workspaceId) {
  return request(`/workspaces/${workspaceId}/today`, { method: 'GET' });
}

export async function getAllTasks(workspaceId) {
  return request(`/workspaces/${workspaceId}/all-tasks`, { method: 'GET' });
}

export async function generateSchedule(workspaceId) {
  return request(`/workspaces/${workspaceId}/schedule`, { method: 'POST' });
}

export async function updateTaskStatus(taskId, status) {
  return request(`/task/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function updateSubtopicStatus(taskId, subtopic, completed) {
  return request(`/task/${taskId}/subtopic`, {
    method: 'PATCH',
    body: JSON.stringify({ subtopic, completed }),
  });
}