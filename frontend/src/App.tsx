import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MeniPage from './pages/MeniPage'; // Tvoj stari kod preimenovan
import LoyaltyPage from './pages/LoyaltyPage';
import './App.css'
import LoginPage from './pages/LoginPage';
import IstorijaPage from './pages/IstorijaPage';
import RegisterPage from './pages/RegisterPage';
import { useCart } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import PrivateRoute from './components/PrivateRoute';
import { useState } from 'react';
import StatusPorudzbine from './components/StatusPorudzbine';
import AdminPage from './pages/AdminPage';



export default function App() {
  const { ukupnoStavki, otvoriDrawer } = useCart();
  const [statusId, setStatusId] = useState<number | null>(null);
  const [statusOtvoren, setStatusOtvoren] = useState(false);

  return (
    <>
      <Navbar />
      <CartDrawer onPorudzbinaKreirana={(id) => {
        setStatusId(id);
        setStatusOtvoren(true); // ← otvori odmah
      }} />

      {statusId && statusOtvoren && (
        <StatusPorudzbine
          porudzbinaId={statusId}
          onZatvori={() => setStatusOtvoren(false)}
          onZavrseno={() => setStatusId(null)}
        />
      )}

      {/* Floating dugme — vidljivo na svim stranicama */}
      {statusId ? (
        // Aktivna porudžbina → otvara status
        <button
          onClick={() => setStatusOtvoren(true)}
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--zelena)',  // ← zelena boja = aktivna porudžbina
            color: '#fff',
            border: 'none',
            fontSize: '1.4rem',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(53,65,25,0.35)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          👨‍🍳
        </button>
      ) : ukupnoStavki > 0 ? (
        // Nema porudžbine, ima stavki → otvara korpu
        <button
          onClick={otvoriDrawer}
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--braon)',
            color: '#fff',
            border: 'none',
            fontSize: '1.4rem',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(77,58,49,0.3)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          🛒
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: 'var(--akcent)',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 700,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {ukupnoStavki}
          </span>
        </button>
      ) : null}

      {/* Rute */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/meni" element={<MeniPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/loyalty" element={<LoyaltyPage />} />

        <Route path="/istorija" element={
          <PrivateRoute><IstorijaPage /></PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute><AdminPage /></PrivateRoute>
        } />
      </Routes>
    </>
  );
}