import { Routes, Route } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import AdminRoute from './components/AdminRoute'
import HomePage from './pages/HomePage'
import TopicPage from './pages/TopicPage'
import LoginPage from './pages/LoginPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AddTopic from './pages/admin/AddTopic'
import AddQuestion from './pages/admin/AddQuestion'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/topic/:topicId" element={<TopicPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin routes — guarded by AdminRoute */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="topics/new" element={<AddTopic />} />
            <Route path="questions/new" element={<AddQuestion />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
