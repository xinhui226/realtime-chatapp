import { Routes, Route, Navigate } from "react-router-dom"
import Navbar from "./components/Navbar"
import HomePage from "./pages/HomePage"
import SignUpPage from "./pages/SignUpPage"
import LoginPage from "./pages/LoginPage"
import SettingPage from "./pages/SettingPage"
import ProfilePage from "./pages/ProfilePage"
import { useAuthStore } from "./store/useAuthStore"
import { useEffect } from "react"
import { Loader } from "lucide-react"
import { Toaster } from "react-hot-toast"
import { useThemeStore } from "./store/useThemeStore"

const App = () => {

  const { user, checkAuth, isCheckingAuth } = useAuthStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isCheckingAuth && !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin"/>
      </div>
    )
  }

  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <HomePage /> : <Navigate to='/login'/>} />
        <Route path="/signup" element={user ? <Navigate to='/' /> : <SignUpPage />} />
        <Route path="/login" element={user ? <Navigate to='/' /> : <LoginPage />} />
        <Route path="/setting" element={<SettingPage />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to='/login'/>} />
      </Routes>
      <Toaster position="top-right" />
    </div>
  )
}

export default App