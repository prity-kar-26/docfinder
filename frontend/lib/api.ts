// const API_URL = "http://localhost:5000/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// A wrapper around fetch that automatically attaches the login token
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}