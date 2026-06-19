import { Routes, Route } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import AdminRoute from './components/AdminRoute'
import HomePage from './pages/HomePage'
import TopicPage from './pages/TopicPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AddTopic from './pages/admin/AddTopic'
import AddQuestion from './pages/admin/AddQuestion'
import ManageTopics from './pages/admin/ManageTopics'
import ManageQuestions from './pages/admin/ManageQuestions'
import EditTopic from './pages/admin/EditTopic'
import EditQuestion from './pages/admin/EditQuestion'
import DeleteTopic from './pages/admin/DeleteTopic'
import DeleteQuestion from './pages/admin/DeleteQuestion'
import RestoreQuestion from './pages/admin/RestoreQuestion'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/topic/:topicId" element={<TopicPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin routes — guarded by AdminRoute */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="topics" element={<ManageTopics />} />
            <Route path="topics/new" element={<AddTopic />} />
            <Route path="topics/:topicId/edit" element={<EditTopic />} />
            <Route path="topics/:topicId/delete" element={<DeleteTopic />} />
            <Route path="questions" element={<ManageQuestions />} />
            <Route path="questions/new" element={<AddQuestion />} />
            <Route path="questions/:questionId/edit" element={<EditQuestion />} />
            <Route path="questions/:questionId/delete" element={<DeleteQuestion />} />
            <Route path="questions/:questionId/restore" element={<RestoreQuestion />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
