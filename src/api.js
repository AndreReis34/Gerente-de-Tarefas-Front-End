import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://api-de-tarefas-3bz5.onrender.com";

export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export async function registerUser(username, password) {
  const { data } = await api.post("/auth/register", { username, password });
  return data;
}

export async function loginUser(username, password) {
  const { data } = await api.post("/auth/login", { username, password });
  return data; // { access_token }
}

// Tasks
export async function listTasks(params) {
  const { data } = await api.get("/tasks", { params });
  return data;
}

export async function createTask(payload) {
  const { data } = await api.post("/tasks", payload);
  return data;
}

export async function updateTask(id, payload) {
  const { data } = await api.put(`/tasks/${id}`, payload);
  return data;
}

export async function deleteTask(id) {
  await api.delete(`/tasks/${id}`);
}

export async function toggleTask(id) {
  const { data } = await api.put(`/tasks/${id}/toggle`);
  return data;
}
