import { Route, Routes } from 'react-router-dom'
import Login from './components/pages/Auth/Login'
import AnnotatorDashboard from './components/pages/Annotator/AnnotatorDashboard'
import AnnotatorWorkspace from './components/pages/Annotator/Workspace/AnnotatorWorkspace'
import CreditScorePage from './components/pages/Annotator/Workspace/CreditScorePage'

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />

      {/* Annotator Routes */}
      <Route path="/annotator" element={<AnnotatorDashboard />} />
      <Route path="/annotator/workspace/:taskId" element={<AnnotatorWorkspace />} />
      <Route path="/annotator/score" element={<CreditScorePage />} /> 
    </Routes>
  )
}

export default App