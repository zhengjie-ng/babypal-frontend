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

    // Only add CSRF token for POST, PUT, DELETE requests
    if (['post', 'put', 'delete'].includes(config.method?.toLowerCase() || '')) {
      let csrfData = JSON.parse(localStorage.getItem("CSRF_DATA") || 'null')
      
      if (!csrfData) {
        try {
          const response = await axios.get(`${API_URL}/api/csrf-token`, {
            withCredentials: true,
            headers: {
              "Access-Control-Allow-Origin": API_URL,
              "Access-Control-Allow-Credentials": true,
            },
          })
          csrfData = response.data
          if (csrfData) {
            localStorage.setItem("CSRF_DATA", JSON.stringify(csrfData))
          }
        } catch (error) {
          console.error("Failed to fetch CSRF token", error)
        }
      }

      if (csrfData?.token && csrfData?.headerName) {
        config.headers[csrfData.headerName] = csrfData.token
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
      console.log("Unauthorized access")
      // Clear CSRF data on 401 as it might be expired
      localStorage.removeItem("CSRF_DATA")
      // localStorage.removeItem("JWT_TOKEN")
      // localStorage.removeItem("USER")
      // localStorage.removeItem("IS_ADMIN")
      // // Only redirect if we're not already on the login page
      // if (!window.location.pathname.includes("/login")) {
      //   window.location.href = "/login"
      // }
    }

    // Handle disabled user accounts
    if (
      error.response?.status === 403 &&
      error.response?.data?.message?.includes("disabled")
    ) {
      console.log("User account is disabled")
      localStorage.removeItem("JWT_TOKEN")
      localStorage.removeItem("USER")
      localStorage.removeItem("CSRF_DATA")
      localStorage.removeItem("IS_ADMIN")
      window.location.href = "/login?disabled=true"
    }

    return Promise.reject(error)
  }
)

export default api
