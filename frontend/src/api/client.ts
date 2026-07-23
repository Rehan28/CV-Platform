import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// Normalizes error messages coming back from the Express error handler
// so components can just read err.message.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error || "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);
