import { upload } from "@vercel/blob/client";

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
  if (!token) throw new Error("Authentication required");
  if (!file.type) throw new Error("Unable to determine the image type");

  // The file goes from the browser directly to Vercel Blob. The API endpoint
  // only authorizes the short-lived upload token and never receives file bytes.
  return upload(`series-covers/${Date.now()}-${file.name}`, file, {
    access: "public",
    handleUploadUrl: apiUrl("/uploads"),
    clientPayload: JSON.stringify({ token }),
  });
}
