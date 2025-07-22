import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Home from './pages/home.jsx'
// import EmployeePortal from './components/EmployeePortal.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* <Home></Home> */}
    {/* <EmployeePortal></EmployeePortal> */}
  </StrictMode>,
)
