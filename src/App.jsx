import { Route, Routes } from 'react-router-dom'
import Login from './components/pages/Auth/Login'
import AnnotatorDashboard from './components/pages/Annotator/AnnotatorDashboard'
import AnnotatorWorkspace from './components/pages/Annotator/Workspace/AnnotatorWorkspace'

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />

      {/* Annotator Routes */}
      <Route path="/annotator" element={<AnnotatorDashboard />} />
      <Route path="/annotator/workspace/:taskId" element={<AnnotatorWorkspace />} />
      
    </Routes>
  )
}

export default App