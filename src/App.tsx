import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import Landing from "./routes/Landing"
import Login from "./routes/Login"
import Signup from "./routes/Signup"
import Home from "./routes/Home"
import Measurements from "./routes/Measurements"
import Dashboard from "./routes/Dashboard"
import Admin from "./routes/Admin"
import DevelopmentalMilestones from "./routes/DevelopmentalMilestones"
import PageNotFound from "./routes/PageNotFound"
import { AuthProvider } from "./context/AuthContext"
import { BabyProvider } from "./context/BabyContext"
import { AdminProvider } from "./context/AdminContext"
import { GrowthGuideProvider } from "./context/GrowthGuideContext"
import { Navbar05 } from "@/components/nav-bar"
import NavBaby from "./components/nav-baby"
import { RecordProvider } from "./context/RecordContext"
import { MeasurementProvider } from "./context/MeasurementContext"
import ForgotPassword from "./routes/ForgotPassword"
import ResetPassword from "./routes/ResetPassword"

function App() {
  return (
    <div>
      <BrowserRouter>
        <AuthProvider>
          <AdminProvider>
            <BabyProvider>
              <GrowthGuideProvider>
                <RecordProvider>
                  <MeasurementProvider>
                  <Toaster position="bottom-center" />
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/" element={<Navbar05 />}>
                      <Route path="/" element={<NavBaby />}>
                        <Route path="/home" element={<Home />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/measurements" element={<Measurements />} />
                        <Route path="/milestones" element={<DevelopmentalMilestones />} />
                      </Route>
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/*" element={<PageNotFound />} />
                    </Route>
                  </Routes>
                  </MeasurementProvider>
                </RecordProvider>
              </GrowthGuideProvider>
            </BabyProvider>
          </AdminProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  )
}

export default App
