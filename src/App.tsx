import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Analyzer from './pages/Analyzer'
import Converter from './pages/Converter'
import About from './pages/About'
import Ocr from './pages/Ocr'
import WordPassport from './pages/WordPassport'
import Dictionary from './pages/Dictionary'
import Login from './pages/Login'
import Register from './pages/Register'
import History from './pages/History'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/app/analyze" element={<Analyzer />} />
        <Route path="/app/convert" element={<Converter />} />
        <Route path="/app/ocr" element={<Ocr />} />
        <Route path="/app/word" element={<WordPassport />} />
        <Route path="/app/dictionary" element={<Dictionary />} />
        <Route path="/app/history" element={<History />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
      </Route>
    </Routes>
  )
}
