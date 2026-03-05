import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MeniPage from './pages/MeniPage'; // Tvoj stari kod preimenovan
import LoyaltyPage from './pages/LoyaltyPage';
import './App.css'
import LoginPage from './pages/LoginPage';
import IstorijaPage from './pages/IstorijaPage';

function App() {
  return (
    <BrowserRouter>
     
      <Navbar />
      
      <Routes>
       
        <Route path="/" element={<HomePage />} />
        
      
        <Route path="/meni" element={<MeniPage />} />
        
        
        <Route path="/login" element={<LoginPage />} />

        <Route path="/loyalty" element={<LoyaltyPage />} />

        <Route path="/istorija" element={<IstorijaPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;