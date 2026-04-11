import { Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import TopicPage from './pages/TopicPage'

function App() {
  return (
      <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/topic/:topicId" element={<TopicPage />} />
      </Routes>
  )
}

export default App
