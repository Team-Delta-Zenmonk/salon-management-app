import axios from "axios";

const appName = import.meta.env.VITE_APP_NAME || "Veloura";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

const handleLogoutAndRedirect = () => {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem("persist:root");
    }
  } catch (err) {
    console.error("Error clearing state on logout:", err);
  }
  if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
    window.location.href = "/login";
  }
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const status = error?.response?.status;
    const code = error?.response?.data?.code;

    if (
      status === 403 &&
      (code === "TRIAL_EXPIRED" || code === "SUBSCRIPTION_EXPIRED")
    ) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(`${appName.toLowerCase()}:subscription-expired`, {
            detail: {
              code,
              message:
                error?.response?.data?.error ||
                "Your trial period has ended. Please upgrade your plan.",
            },
          })
        );
      }
      return Promise.reject(error);
    }

    if (
      (status === 401 || status === 403) &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh/salon") &&
      !originalRequest.url?.includes("/auth/login/salon")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post("/auth/refresh/salon");
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        handleLogoutAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);