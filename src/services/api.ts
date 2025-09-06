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

    // Add additional headers for CORS
    config.headers["Access-Control-Allow-Origin"] = API_URL
    config.headers["Access-Control-Allow-Credentials"] = true

    let csrfToken = localStorage.getItem("CSRF_TOKEN")
    if (!csrfToken) {
      try {
        const response = await axios.get(`${API_URL}/api/csrf-token`, {
          withCredentials: true,
          headers: {
            "Access-Control-Allow-Origin": API_URL,
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
      // localStorage.removeItem("JWT_TOKEN")
      // localStorage.removeItem("USER")
      // localStorage.removeItem("CSRF_TOKEN")
      // window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export default api
