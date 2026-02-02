
import { Route, Routes } from 'react-router-dom'
import Login from './components/pages/Auth/Login'



function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />
    </Routes>
  )
}

export default App
