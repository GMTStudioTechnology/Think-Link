import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './components/Landing'
import Signup from './components/Signup'
import ThinkLink from './components/ThinkLink'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/ThinkLink" element={<ThinkLink />} />
        {/* Add other routes as needed */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
