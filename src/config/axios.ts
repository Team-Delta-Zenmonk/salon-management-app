import axios from "axios";

const appName = import.meta.env.VITE_APP_NAME || "Veloura";
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
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
    }

    return Promise.reject(error);
  }
);