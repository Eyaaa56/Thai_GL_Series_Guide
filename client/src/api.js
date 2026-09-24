// Use the same origin by default.  In development Vite proxies /api to the
// Express server; this also keeps the app working when opened via the PC's
// LAN address instead of only through localhost.
const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

export const apiUrl = (path) => `${API_BASE_URL}${path}`;

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("roseframe_token");
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(apiUrl(path), { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function uploadFile(file) {
  const token = localStorage.getItem("roseframe_token");
  const response = await fetch(apiUrl("/uploads"), {
    method: "POST",
    headers: {
      "Content-Type": file.type,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: file,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Upload failed");
  return data;
}
