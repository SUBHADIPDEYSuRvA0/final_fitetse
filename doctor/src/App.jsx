import React from 'react'
import './App.css';

import { BrowserRouter , Route , Routes  } from 'react-router';
import Home from './pages/home';
import About from './pages/About';
import Contact from './pages/Contact';
import Packages from './pages/Packages';
// import EmployeePortal from './components/EmployeePortal';
import Termspage from './pages/Termspage';
import PrivacyPolicy from './components/PrivacyPolicy';

import Login from './pages/login';
import SignUp from './components/SignUp'; 
import Invoicepage from './pages/Invoicepage';
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    <div>
      {/* <Home></Home> */}
      <BrowserRouter>
      <Routes>
      <Route path='/' element={<Home></Home>}/>
      <Route path='/about' element={<About></About>} />
      <Route path='/packages' element={<Packages></Packages>} />
      <Route path='/contact' element={<Contact></Contact>} />
       <Route path='/packages' element={<Packages></Packages>} />
      <Route path='/privacy' element={<PrivacyPolicy></PrivacyPolicy>} />
      <Route path='/terms' element={<Termspage></Termspage>} />
      <Route path='/login' element={<Login></Login>} />
      <Route path='/dash' element={<Dashboard></Dashboard>} />
      <Route path='/signup' element={<SignUp></SignUp>} />
      <Route path='/invoice' element={<Invoicepage></Invoicepage>} />

      
      {/* <Home></Home> */}
      </Routes>
      
      </BrowserRouter>
      
    </div>
  )
}

export default App