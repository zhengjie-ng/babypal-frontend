import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import Landing from "./routes/Landing"
import Login from "./routes/Login"
import Signup from "./routes/Signup"
import Home from "./routes/Home"
import Measurements from "./routes/Measurements"
import Dashboard from "./routes/Dashboard"
import Admin from "./routes/Admin"
import PageNotFound from "./routes/PageNotFound"
import { AuthProvider } from "./context/AuthContext"
import { BabyProvider } from "./context/BabyContext"
import { Navbar05 } from "@/components/nav-bar"
import NavBaby from "./components/nav-baby"
import { RecordProvider } from "./context/RecordContext"
import { MeasurementProvider } from "./context/MeasurementContext"

function App() {
  return (
    <div>
      <BrowserRouter>
        <AuthProvider>
          <BabyProvider>
            <RecordProvider>
              <MeasurementProvider>
                <Toaster position="bottom-center" />
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/" element={<Navbar05 />}>
                    <Route path="/" element={<NavBaby />}>
                      <Route path="/home" element={<Home />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/measurements" element={<Measurements />} />
                    </Route>
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/*" element={<PageNotFound />} />
                  </Route>
                </Routes>
              </MeasurementProvider>
            </RecordProvider>
          </BabyProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  )
}

export default App
