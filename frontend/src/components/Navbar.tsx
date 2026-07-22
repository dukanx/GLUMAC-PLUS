import { Link, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import logoDark from '../assets/logoDark.png';
import gpBlack from '../assets/GPblackNOBG.png';
import styles from './Navbar.module.css';
import { useAuth } from '../context/AuthContext';
import { Srce, Odjava, Hamburger } from './Doodle';

const SLOGAN = '— sveže, brzo, u srcu Dorćola —';

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
                <button className={styles.mobZatvori} onClick={zatvori} aria-label="Zatvori meni">×</button>
                <nav className={styles.mobLinkovi}>
                    {jeZaposleni ? (
                        <NavLink to="/panel" className={mobKlasa} onClick={zatvori}>
                            Panel<span className={styles.mobBroj}>01</span>
                        </NavLink>
                    ) : (
                        <>
                            <NavLink to="/meni" className={mobKlasa} onClick={zatvori}>
                                Meni<span className={styles.mobBroj}>01</span>
                            </NavLink>
                            <NavLink to="/loyalty" className={mobKlasa} onClick={zatvori}>
                                Loyalty<span className={styles.mobBroj}>02</span>
                            </NavLink>
                            {korisnik && (
                                <>
                                    <NavLink to="/istorija" className={mobKlasa} onClick={zatvori}>
                                        Porudžbine<span className={styles.mobBroj}>03</span>
                                    </NavLink>
                                    <NavLink to="/omiljene" className={mobKlasa} onClick={zatvori}>
                                        Omiljene<span className={styles.mobBroj}>04</span>
                                    </NavLink>
                                </>
                            )}
                        </>
                    )}
                    {korisnik ? (
                        <button className={styles.mobOdjava} onClick={handleLogout}>Odjava</button>
                    ) : (
                        <NavLink
                            to="/login"
                            className={`${styles.mobLink} ${styles.mobPrijava}`}
                            onClick={zatvori}
                        >
                            Prijava →
                        </NavLink>
                    )}
                </nav>
                <p className={styles.mobDno}>{SLOGAN}</p>
            </div>
        </>
    );
}
