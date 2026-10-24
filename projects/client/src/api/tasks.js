const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(data.error || "The request could not be completed.");
  }

  return data;
}

export const getTasks = () => request("/tasks");

export const createTask = (title) =>
  request("/tasks", {
    method: "POST",
    body: JSON.stringify({ title }),
  });

export const updateTask = (id, updates) =>
  request(`/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

export const deleteTask = (id) =>
  request(`/tasks/${id}`, {
    method: "DELETE",
  });
