import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../assets/logo.png';
import styles from './Navbar.module.css';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { korisnik, logout } = useAuth();
  const { ukupnoStavki } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const uloga = (korisnik as any)?.uloga;

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const navLinkKlasa = ({ isActive }: { isActive: boolean }) =>
    `${styles.navLink} ${isActive ? styles.navLinkAktivan : ''}`;

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>

      {/* LOGO */}
      <Link to="/" className={styles.logo}>
        <img src={logo} alt="Glumac Plus" className={styles.logoImg} />
      </Link>

      {/* CENTAR — navigacija */}
      <div className={styles.center}>
        <NavLink to="/meni" className={navLinkKlasa}>
          Meni
        </NavLink>
        {korisnik && (
          <>
            <NavLink to="/loyalty" className={navLinkKlasa}>
              Loyalty
            </NavLink>
            <NavLink to="/istorija" className={navLinkKlasa}>
              Porudžbine
            </NavLink>
            {(uloga === 'ADMIN' || uloga === 'ZAPOSLENI') && (
              <NavLink to="/admin" className={navLinkKlasa}>
                Panel
              </NavLink>
            )}
          </>
        )}
      </div>

      {/* DESNO — auth */}
      <div className={styles.desno}>
        {korisnik ? (
          <>
            <div className={styles.korisnikInfo}>
              <span className={styles.korisnikIme}>{korisnik.ime}</span>
              <span className={styles.korisnikBodovi}>
                {korisnik.brojBodova} bodova
              </span>
            </div>
            <button
              className={styles.korpaIkona}
              onClick={() => navigate('/meni')}
              aria-label="Korpa"
            >
              🛒
              {ukupnoStavki > 0 && (
                <span className={styles.korpaBadge}>{ukupnoStavki}</span>
              )}
            </button>
            <button onClick={handleLogout} className={styles.dugmeOdjava}>
              Odjavi se
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.dugmePrijava}>
              Prijava
            </Link>
            <Link to="/register" className={styles.dugmeRegistracija}>
              Registracija
            </Link>
          </>
        )}
      </div>

    </nav>
  );
}