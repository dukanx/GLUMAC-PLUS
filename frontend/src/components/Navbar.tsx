import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../assets/logo.png';
import '../App.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [korisnik, setKorisnik] = useState(() => {
    const json = sessionStorage.getItem('korisnik');
    return json ? JSON.parse(json) : null;
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prati login/logout promene u istoj tab-i
  useEffect(() => {
    const handleUpdate = () => {
      const json = sessionStorage.getItem('korisnik');
      setKorisnik(json ? JSON.parse(json) : null);
    };
    window.addEventListener('korisnikUpdate', handleUpdate);
    return () => window.removeEventListener('korisnikUpdate', handleUpdate);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('korisnik');
    sessionStorage.removeItem('mojaKorpa');
    setKorisnik(null);
    window.location.href = '/';
  };

  return (
    <nav className={`navbar-container ${scrolled ? 'scrolled' : ''}`}>

      {/* LOGO */}
      <div className="navbar-logo">
        <Link to="/">
          <img src={logo} alt="GLUMAC PLUS" className="logo-img" />
        </Link>
      </div>

      {/* NAVIGACIJA */}
      <div className="navbar-center">
        <NavLink to="/meni" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Meni
        </NavLink>
        {korisnik && (
          <>
            <NavLink to="/loyalty" className={({ isActive }) => `nav-link loyalty-link ${isActive ? 'active' : ''}`}>
              <span className="link-text">Loyalty</span>
              <span className="emoji">𖢻</span>
            </NavLink>
            <NavLink to="/istorija" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Porudžbine
            </NavLink>
          </>
        )}
      </div>

      {/* LOGIN / LOGOUT */}
      <div className="navbar-login">
        {korisnik ? (
          <>
            <span className="nav-user-name">{korisnik.ime}</span>
            <button onClick={handleLogout} className="nav-btn-logout">Odjavi se</button>
          </>
        ) : (
          <Link to="/login">
            <button className="nav-btn">Prijava</button>
          </Link>
        )}
      </div>

    </nav>
  );
}
