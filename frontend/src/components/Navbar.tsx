import { Link, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
    UtensilsCrossed, Star, ClipboardList, Heart,
    LogIn, LogOut, LayoutDashboard,
} from 'lucide-react';
import gpWhiteLogo from '../assets/GPwhiteNOBG.png';
import gpBlackLogo from '../assets/GPblackNOBG.png';
import styles from './Navbar.module.css';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { korisnik, logout } = useAuth();
    const { pathname } = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [menuOtvoren, setMenuOtvoren] = useState(false);
    const uloga = korisnik?.uloga;
    const jeZaposleni = uloga === 'ADMIN' || uloga === 'ZAPOSLENI';
    const jeHome = pathname === '/';
    const svetli = jeHome && !scrolled;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = menuOtvoren ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOtvoren]);

    const handleLogout = () => {
        logout();
        setMenuOtvoren(false);
        window.location.href = '/';
    };

    const navKlasa = ({ isActive }: { isActive: boolean }) =>
        `${styles.navLink} ${isActive ? styles.navLinkAktivan : ''}`;

    const zatvori = () => setMenuOtvoren(false);

    const navKlase = [
        styles.navbar,
        scrolled ? styles.navbarScrolled : '',
        !svetli ? styles.navbarTamni : '',
    ].filter(Boolean).join(' ');

    return (
        <>
            <nav className={navKlase}>

                {/* Logo */}
                <Link to="/" className={styles.logo}>
                    <img
                        src={svetli ? gpWhiteLogo : gpBlackLogo}
                        alt="Glumac Plus"
                        className={styles.logoImg}
                    />
                </Link>

                {/* Centar — navigacija (desktop) */}
                <div className={styles.center}>
                    {jeZaposleni ? (
                        <NavLink to="/admin" className={navKlasa}>
                            <LayoutDashboard size={13} strokeWidth={1.5} /> Panel
                        </NavLink>
                    ) : korisnik ? (
                        <>
                            <NavLink to="/meni" className={navKlasa}>
                                <UtensilsCrossed size={13} strokeWidth={1.5} /> Meni
                            </NavLink>
                            <span className={styles.navDivider} />
                            <NavLink to="/loyalty" className={navKlasa}>
                                <Star size={13} strokeWidth={1.5} /> Loyalty
                            </NavLink>
                            <span className={styles.navDivider} />
                            <NavLink to="/istorija" className={navKlasa}>
                                <ClipboardList size={13} strokeWidth={1.5} /> Porudžbine
                            </NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink to="/meni" className={navKlasa}>
                                <UtensilsCrossed size={13} strokeWidth={1.5} /> Meni
                            </NavLink>
                            <span className={styles.navDivider} />
                            <NavLink to="/loyalty" className={navKlasa}>
                                <Star size={13} strokeWidth={1.5} /> Loyalty
                            </NavLink>
                        </>
                    )}
                </div>

                {/* Desno (desktop) */}
                <div className={styles.desno}>
                    {korisnik ? (
                        <>
                            <Link to="/omiljene" className={styles.ikonicaDugme} title="Omiljene">
                                <Heart size={16} strokeWidth={1.5} />
                            </Link>
                            <span className={styles.korisnikIme}>{korisnik.ime}</span>
                            <button onClick={handleLogout} className={styles.dugmeOdjava} title="Odjavi se">
                                <LogOut size={16} strokeWidth={1.5} />
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className={styles.dugmePrijava}>
                            <LogIn size={13} strokeWidth={1.5} /> Prijava
                        </Link>
                    )}
                </div>

                {/* Mobilni desni ugao — ime + omiljene (samo mobile) */}
                <div className={styles.mobileDesno}>
                    {korisnik && (
                        <>
                            <span className={styles.mobileIme}>{korisnik.ime}</span>
                            <Link to="/omiljene" className={styles.mobileSrce} onClick={zatvori} title="Omiljene">
                                <Heart size={17} strokeWidth={1.5} />
                            </Link>
                        </>
                    )}
                </div>

                {/* Hamburger — 3 linije → X animacija */}
                <button
                    className={`${styles.hamburger} ${menuOtvoren ? styles.hamburgerOtvoren : ''}`}
                    onClick={() => setMenuOtvoren(v => !v)}
                    aria-label={menuOtvoren ? 'Zatvori meni' : 'Otvori meni'}
                >
                    <span className={styles.bar} />
                    <span className={styles.bar} />
                    <span className={styles.bar} />
                </button>
            </nav>

            {/* Mobilni drop meni */}
            {menuOtvoren && (
                <div className={`${styles.mobileMenu} ${!svetli ? styles.mobileMenuSvetli : ''}`}>
                    <NavLink to="/meni" className={styles.mobilniLink} onClick={zatvori}>
                        <UtensilsCrossed size={15} strokeWidth={1.5} /> Meni
                    </NavLink>
                    <NavLink to="/loyalty" className={styles.mobilniLink} onClick={zatvori}>
                        <Star size={15} strokeWidth={1.5} /> Loyalty
                    </NavLink>
                    {korisnik && !jeZaposleni && (
                        <>
                            <NavLink to="/istorija" className={styles.mobilniLink} onClick={zatvori}>
                                <ClipboardList size={15} strokeWidth={1.5} /> Porudžbine
                            </NavLink>
                            <NavLink to="/omiljene" className={styles.mobilniLink} onClick={zatvori}>
                                <Heart size={15} strokeWidth={1.5} /> Omiljene
                            </NavLink>
                        </>
                    )}
                    {jeZaposleni && (
                        <NavLink to="/admin" className={styles.mobilniLink} onClick={zatvori}>
                            <LayoutDashboard size={15} strokeWidth={1.5} /> Panel
                        </NavLink>
                    )}
                    <div className={styles.mobilniDivider} />
                    {korisnik ? (
                        <button onClick={handleLogout} className={styles.mobilniOdjava}>
                            <LogOut size={15} strokeWidth={1.5} /> Odjavi se
                        </button>
                    ) : (
                        <NavLink to="/login" className={styles.mobilniLink} onClick={zatvori}>
                            <LogIn size={15} strokeWidth={1.5} /> Prijava
                        </NavLink>
                    )}
                </div>
            )}
        </>
    );
}
