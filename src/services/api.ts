import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Keep this to handle cookies properly
})

// Add a request interceptor to include JWT and CSRF tokens
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("JWT_TOKEN")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Note: Access-Control-Allow-Origin should only be set by the server
    // Removing client-side CORS headers as they can cause authentication issues

    let csrfToken = localStorage.getItem("CSRF_TOKEN")
    if (!csrfToken) {
      try {
        const response = await axios.get(`${API_URL}/api/csrf-token`, {
          withCredentials: true,
        })
        csrfToken = response.data.token
        if (csrfToken) {
          localStorage.setItem("CSRF_TOKEN", csrfToken)
        }
      } catch (error) {
        console.error("Failed to fetch CSRF token", error)
      }
    }

    if (csrfToken) {
      config.headers["X-XSRF-TOKEN"] = csrfToken
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("401 Unauthorized Error Details:", {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      })
      console.log("Clearing auth data and redirecting to login...")
      localStorage.removeItem("JWT_TOKEN")
      localStorage.removeItem("USER")
      localStorage.removeItem("CSRF_TOKEN")
      localStorage.removeItem("IS_ADMIN")
      // Add a small delay to allow console logs to be visible
      setTimeout(() => {
        window.location.href = "/login"
      }, 1000000)
    }
    return Promise.reject(error)
  }
)

export default api
