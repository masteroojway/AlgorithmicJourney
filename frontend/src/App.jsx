import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import './App.css'
import Home from './pages/Home'
import Notes from './pages/Notes'
import Login from './pages/Login'
import Register from './pages/Register'
import DefaultLanding from './pages/Intro'
import Pomodoro from './pages/Pomodoro'
import Potd from './pages/Potd'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/home' element={<Home />} />
        <Route path='/notes' element={<Notes />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<DefaultLanding />} />
        <Route path='/pomodoro' element={<Pomodoro />} />
        <Route path='/potd' element={<Potd />} />
      </Routes>
    </Router>
  )
}

export default App
