import { Link, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import logoDark from '../assets/logoDark.png';
import gpBlack from '../assets/GPblackNOBG.png';
import styles from './Navbar.module.css';
import { useAuth } from '../context/AuthContext';
import { Srce, Odjava, Hamburger, Profil } from './Doodle';

export default function Navbar() {
    const { korisnik, popust, logout } = useAuth();
    const { pathname } = useLocation();
    const jeHome = pathname === '/';
    const [scrolled, setScrolled] = useState(false);
    const [menuOtvoren, setMenuOtvoren] = useState(false);
    const [dropOtvoren, setDropOtvoren] = useState(false);

    // Prati skrol na home da bismo znali koji logo prikazati.
    useEffect(() => {
        if (!jeHome) { setScrolled(false); return; }
        const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.28);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [jeHome]);

    // Home vrh → GP monogram; skrol ili druga strana → logoDark. Crossfade između njih.
    const prikaziBlack = jeHome && !scrolled;
    const desnoRef = useRef<HTMLDivElement>(null);
    const uloga = korisnik?.uloga;
    const jeZaposleni = uloga === 'ADMIN' || uloga === 'ZAPOSLENI';
    const inicijal = korisnik?.ime?.trim().charAt(0).toUpperCase() ?? '';

    useEffect(() => {
        document.body.style.overflow = menuOtvoren ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOtvoren]);

    // Klik van desne zone zatvara dropdown pod avatarom
    useEffect(() => {
        if (!dropOtvoren) return;
        const onClickVan = (e: MouseEvent) => {
            if (desnoRef.current?.contains(e.target as Node)) return;
            setDropOtvoren(false);
        };
        document.addEventListener('mousedown', onClickVan);
        return () => document.removeEventListener('mousedown', onClickVan);
    }, [dropOtvoren]);

    const handleLogout = () => {
        logout();
        setDropOtvoren(false);
        setMenuOtvoren(false);
        window.location.href = '/';
    };

    const navKlasa = ({ isActive }: { isActive: boolean }) =>
        `${styles.navLink} ${isActive ? styles.navLinkAktivan : ''}`;

    const mobKlasa = ({ isActive }: { isActive: boolean }) =>
        `${styles.mobLink} ${isActive ? styles.mobLinkAktivan : ''}`;

    const zatvori = () => setMenuOtvoren(false);

    // Klik na logo — uvek na vrh home stranice (bilo da sam na home ili ne),
    // ne tamo dokle je skrol stao.
    const naVrhHome = () => window.scrollTo({ top: 0, behavior: jeHome ? 'smooth' : 'auto' });

    return (
        <>
            <nav className={styles.navbar}>

                {/* Logo — crossfade: GP monogram na home vrhu ↔ logoDark pri skrolu/drugoj strani */}
                <Link to="/" className={styles.logo} onClick={naVrhHome} aria-label="Glumac Plus — početna">
                    <motion.img
                        src={logoDark}
                        alt="Glumac Plus"
                        className={styles.logoImg}
                        animate={{ opacity: prikaziBlack ? 0 : 1, y: prikaziBlack ? 12 : 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <motion.img
                        src={gpBlack}
                        alt=""
                        aria-hidden="true"
                        className={styles.logoImgHome}
                        animate={{ opacity: prikaziBlack ? 1 : 0, y: prikaziBlack ? 0 : -12 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                </Link>

                {/* Centar — navigacija (desktop) */}
                <div className={styles.center}>
                    {jeZaposleni ? (
                        <NavLink to="/panel" className={navKlasa}>Panel</NavLink>
                    ) : (
                        <>
                            <NavLink to="/meni" className={navKlasa}>Meni</NavLink>
                            <NavLink to="/loyalty" className={navKlasa}>Loyalty</NavLink>
                            {korisnik && (
                                <NavLink to="/istorija" className={navKlasa}>Porudžbine</NavLink>
                            )}
                        </>
                    )}
                </div>

                {/* Desno — srce (Omiljene) + avatar / Prijava + hamburger */}
                <div className={styles.desno} ref={desnoRef}>
                    {korisnik ? (
                        <>
                            {!jeZaposleni && (
                                <Link to="/omiljene" className={styles.srceDugme} title="Omiljene">
                                    <Srce size={19} />
                                </Link>
                            )}
                            <button
                                className={styles.avatar}
                                onClick={() => setDropOtvoren(v => !v)}
                                aria-label="Nalog"
                            >
                                {inicijal}
                            </button>
                            {dropOtvoren && (
                                <div className={styles.drop}>
                                    <div className={styles.dropHead}>
                                        <span className={styles.dropIme}>{korisnik.ime}</span>
                                        {korisnik.loyaltyNivo && (
                                            <span className={styles.dropNivo}>
                                                {korisnik.loyaltyNivo.toLowerCase()}{popust > 0 ? ` · −${popust}%` : ''}
                                            </span>
                                        )}
                                    </div>
                                    <button className={styles.dropOdjava} onClick={handleLogout}>
                                        <Odjava size={17} /> ODJAVA
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <Link to="/login" className={styles.dugmePrijava}>Prijava</Link>
                    )}
                    <button
                        className={styles.hamburger}
                        onClick={() => setMenuOtvoren(true)}
                        aria-label="Otvori meni"
                    >
                        <Hamburger size={30} />
                    </button>
                </div>
            </nav>

            {/* Mobilni pun-ekran meni */}
            <div className={`${styles.mobMeni} ${menuOtvoren ? styles.mobMeniOtvoren : ''}`}>
                <div className={styles.mobHead}>
                    <Link
                        to="/"
                        className={styles.mobLogoLink}
                        onClick={() => { zatvori(); naVrhHome(); }}
                        aria-label="Glumac Plus — početna"
                    >
                        <img src={logoDark} alt="Glumac Plus" className={styles.mobLogo} />
                    </Link>
                    <button className={styles.mobZatvori} onClick={zatvori} aria-label="Zatvori meni">
                        <svg className={styles.burgerX} viewBox="0 0 30 24" fill="none" aria-hidden="true">
                            <path className={styles.blTop} d="M2 4 C 10 3, 20 5, 28 3.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                            <path className={styles.blMid} d="M3 12 C 11 11, 19 13, 27 11.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                            <path className={styles.blBot} d="M2 20 C 10 19, 20 21, 28 19.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
                <nav className={styles.mobLinkovi}>
                    {jeZaposleni ? (
                        <NavLink to="/panel" className={mobKlasa} onClick={zatvori}>
                            Panel
                            <span className={styles.mobIko}>
                                <svg viewBox="0 0 48 62" fill="none"><path d="M12 12 L 36 12 L 36 56 L 12 56 Z" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" /><path d="M18 12 L 18 7 C 18 6, 19 5, 20 5 L 28 5 C 29 5, 30 6, 30 7 L 30 12" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" /><path d="M18 27 L 30 27 M18 37 L 30 37 M18 47 L 26 47" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
                            </span>
                        </NavLink>
                    ) : (
                        <>
                            <NavLink to="/meni" className={mobKlasa} onClick={zatvori}>
                                Meni
                                <span className={styles.mobIko}>
                                    <svg viewBox="0 0 60 70" fill="none"><path d="M10 8 C 24 4, 38 4, 50 8 L 48 62 C 36 66, 24 66, 12 62 Z" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" /><path d="M20 24 L 40 24 M20 34 L 42 34 M20 44 L 36 44" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
                                </span>
                            </NavLink>
                            <NavLink to="/loyalty" className={mobKlasa} onClick={zatvori}>
                                Loyalty
                                <span className={styles.mobIko}>
                                    <svg viewBox="0 0 60 60" fill="none"><path d="M30 6 L 34 24 L 52 28 L 34 33 L 30 52 L 26 33 L 8 28 L 26 24 Z" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" /></svg>
                                </span>
                            </NavLink>
                            {korisnik && (
                                <>
                                    <NavLink to="/istorija" className={mobKlasa} onClick={zatvori}>
                                        Porudžbine
                                        <span className={styles.mobIko}>
                                            <svg viewBox="0 0 48 62" fill="none"><path d="M10 6 L 38 6 L 38 54 L 31 49 L 24 54 L 17 49 L 10 54 Z" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" /><path d="M17 22 L 31 22 M17 31 L 31 31 M17 40 L 27 40" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
                                        </span>
                                    </NavLink>
                                    <NavLink to="/omiljene" className={mobKlasa} onClick={zatvori}>
                                        Omiljene
                                        <span className={styles.mobIko}>
                                            <svg viewBox="0 0 60 54" fill="none"><path d="M30 48 C 8 32, 4 16, 14 9 C 22 4, 29 10, 30 16 C 31 10, 38 4, 46 9 C 56 16, 52 32, 30 48 Z" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" /></svg>
                                        </span>
                                    </NavLink>
                                </>
                            )}
                        </>
                    )}
                </nav>

                {/* Prijava / Odjava — odvojeno, niže */}
                <div className={styles.mobAuth}>
                    {korisnik ? (
                        <button className={styles.mobOdjava} onClick={handleLogout}>
                            <Odjava size={28} /> Odjava
                        </button>
                    ) : (
                        <NavLink to="/login" className={styles.mobPrijava} onClick={zatvori}>
                            <Profil size={28} /> Prijava →
                        </NavLink>
                    )}
                </div>

                <div className={styles.mobFoot}>
                    <a href="tel:+381658178476" className={styles.mobTel} onClick={zatvori}>
                        +381 65 817 8476
                    </a>
                </div>
            </div>
        </>
    );
}
