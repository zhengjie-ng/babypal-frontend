import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL
const CLIENT_URL = import.meta.env.VITE_CLIENT_URL

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
})

// Add a request interceptor to include JWT and CSRF tokens
api.interceptors.request.use(
  async (config) => {
    // Log request data for debugging
    console.log("Request data:", {
      url: config.url,
      method: config.method,
      data: JSON.parse(JSON.stringify(config.data || {})),
      headers: JSON.parse(JSON.stringify(config.headers)),
    })

    const token = localStorage.getItem("JWT_TOKEN")
    const isAuthEndpoint = config.url?.includes("/auth/public/")

    if (!isAuthEndpoint) {
      if (!token) {
        console.warn("No JWT token found in localStorage")
        // If not an auth endpoint and no token, clear everything and redirect
        localStorage.removeItem("JWT_TOKEN")
        localStorage.removeItem("USER")
        localStorage.removeItem("CSRF_TOKEN")
        localStorage.removeItem("IS_ADMIN")
        window.location.href = "/login"
        return Promise.reject(new Error("No authentication token"))
      }
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add additional headers for CORS
    config.headers["Access-Control-Allow-Origin"] = CLIENT_URL
    config.headers["Access-Control-Allow-Credentials"] = true

    let csrfToken = localStorage.getItem("CSRF_TOKEN")
    if (!csrfToken) {
      try {
        const response = await axios.get(`${API_URL}/api/csrf-token`, {
          withCredentials: true,
          headers: {
            "Access-Control-Allow-Origin": CLIENT_URL,
            "Access-Control-Allow-Credentials": true,
          },
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
      console.log("Unauthorized access")
      localStorage.removeItem("JWT_TOKEN")
      localStorage.removeItem("USER")
      localStorage.removeItem("CSRF_TOKEN")
      localStorage.removeItem("IS_ADMIN")
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export default api
