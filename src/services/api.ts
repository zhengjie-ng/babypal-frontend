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

    // For POST/PUT/PATCH/DELETE requests, fetch CSRF token from API endpoint
    // This uses session-based CSRF tokens instead of cookies for cross-site compatibility
    if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      try {
        const response = await axios.get(`${API_URL}/api/csrf-token`, {
          withCredentials: true,
        })
        if (response.data.token) {
          config.headers["X-XSRF-TOKEN"] = response.data.token
        }
      } catch (error) {
        console.error("Failed to fetch CSRF token", error)
      }
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
      localStorage.removeItem("IS_ADMIN")
      // CSRF token is in cookies, will be cleared by browser
      // Add a small delay to allow console logs to be visible
      setTimeout(() => {
        window.location.href = "/login"
      }, 1000000)
    }
    return Promise.reject(error)
  }
)

export default api
