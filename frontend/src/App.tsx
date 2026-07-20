import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MeniPage from './pages/MeniPage';
import LoyaltyPage from './pages/LoyaltyPage';
import './App.css'
import LoginPage from './pages/LoginPage';
import IstorijaPage from './pages/IstorijaPage';
import RegisterPage from './pages/RegisterPage';
import CartDrawer from './components/CartDrawer';
import PrivateRoute from './components/PrivateRoute';
import StatusPorudzbine from './components/StatusPorudzbine';
import FloatingBubble from './components/FloatingBubble';
import PanelPorudzbina from './pages/PanelPorudzbina';
import OmiljenePage from './pages/OmiljenePage';

export default function App() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <StatusPorudzbine />
      <FloatingBubble />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/meni" element={<MeniPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/loyalty" element={<LoyaltyPage />} />
        <Route path="/istorija" element={
          <PrivateRoute><IstorijaPage /></PrivateRoute>
        } />
        <Route path="/omiljene" element={
          <PrivateRoute><OmiljenePage /></PrivateRoute>
        } />
        <Route path="/panel" element={
          <PrivateRoute><PanelPorudzbina /></PrivateRoute>
        } />
      </Routes>
    </>
  );
}
