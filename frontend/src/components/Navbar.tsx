import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from "react";
import logo from '../assets/logo.png'; 
import '../App.css';

export default function Navbar() {

  const [scrolled, setScrolled] = useState(false);

  // Provera da li je korisnik ulogovan
  const korisnikJson = sessionStorage.getItem("korisnik");
  const korisnik = korisnikJson ? JSON.parse(korisnikJson) : null;

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Logout
  const handleLogout = () => {
    sessionStorage.removeItem("korisnik");
    sessionStorage.removeItem("mojaKorpa");
    window.location.href = "/";
  };

  return (
  <nav className={`navbar-container ${scrolled ? "scrolled" : ""}`}>

    {/* LEVO: LOGO */}
    <div className="navbar-logo">
      <Link to="/" >
        <img 
          src={logo} 
          alt="GLUMAC PLUS" 
         className='logo-img'
        />
      </Link>
    </div>

    {/* CENTAR: LINKOVI */}
    <div className="navbar-center">
     
<NavLink 
  to="/meni" 
  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
>
  Meni
</NavLink>
      {korisnik ? (
        <>
        <NavLink to="/loyalty" className={({ isActive }) => `nav-link loyalty-link ${isActive ? 'active' : ''}`}>
  
  <span className="link-text">Loyalty</span>
  <span className="emoji">𖢻</span>
</NavLink>
          <NavLink to="/istorija" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Porudžbine</NavLink>
        </>
      ): (
      <>
        
                <div className="nav-link placeholder"></div>

        <div className="nav-link placeholder"></div>
        <div className="nav-link placeholder"></div>

        <div className="nav-link placeholder"></div>
      </>
    )}
    </div>

    {/* DESNO: KORISNIK / ODJAVA */}
    <div className="navbar-login">
      {korisnik ? (
        <>
          <span className="nav-user-name">{korisnik.ime}</span>
          <button onClick={handleLogout} className="nav-btn-logout">Odjavi se</button>
        </>
      ) : (
 <Link to="/login">
        <button className="nav-btn">Prijava</button>
      </Link>      )}
    </div>

  </nav>
);

}
