import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Grafikon, Priznanica, Klose, Zvezda, Kupon, Ljudi, Osoba, Sat,
} from '../components/Doodle';
import AdminMeni from '../components/admin/AdminMeni';
import AdminPorudzbine from '../components/admin/AdminPorudzbine';
import AdminKorisnici from '../components/admin/AdminKorisnici';
import AdminRadnoVreme from '../components/admin/AdminRadnoVreme';
import AdminZaposleni from '../components/admin/AdminZaposleni';
import styles from './AdminPanel.module.css';
import logoDark from '../assets/logoDark.png';

/**
 * Admin panel — „kancelarija" vlasnika: tamni sidebar levo, papir kao radna
 * površina desno. Odvojen od panela zaposlenog (`/panel`), koji vodi porudžbine
 * uživo; ovde se menja katalog i konfiguracija.
 *
 * Sekcije se prebacuju stanjem, ne rutama — panel je jedan ekran za jednog
 * korisnika, pa deljivi linkovi na pojedinačnu sekciju nemaju kome da trebaju.
 */

type Sekcija = 'PREGLED' | 'PORUDZBINE' | 'MENI' | 'LOYALTY' | 'PROMO' | 'KORISNICI' | 'ZAPOSLENI' | 'RADNO_VREME';

const SEKCIJE: { kljuc: Sekcija; naziv: string; Ikona: typeof Grafikon }[] = [
    { kljuc: 'PREGLED', naziv: 'PREGLED', Ikona: Grafikon },
    { kljuc: 'PORUDZBINE', naziv: 'PORUDŽBINE', Ikona: Priznanica },
    { kljuc: 'MENI', naziv: 'MENI', Ikona: Klose },
    { kljuc: 'LOYALTY', naziv: 'LOYALTY', Ikona: Zvezda },
    { kljuc: 'PROMO', naziv: 'PROMO KODOVI', Ikona: Kupon },
    { kljuc: 'KORISNICI', naziv: 'KORISNICI', Ikona: Ljudi },
    { kljuc: 'ZAPOSLENI', naziv: 'ZAPOSLENI', Ikona: Osoba },
    { kljuc: 'RADNO_VREME', naziv: 'RADNO VREME', Ikona: Sat },
];

export default function AdminPanel() {
    const { korisnik, logout } = useAuth();
    const [sekcija, setSekcija] = useState<Sekcija>('MENI');

    // Panel je samo vlasnikov. Zaposleni ima svoj panel, kupac nema šta da traži.
    if (!korisnik) return <Navigate to="/login" replace />;
    if (korisnik.uloga !== 'ADMIN') return <Navigate to="/" replace />;

    return (
        <div className={styles.ekran}>
            <aside className={styles.sidebar}>
                <img src={logoDark} alt="Glumac Plus" className={styles.logo} />

                <nav className={styles.nav}>
                    {SEKCIJE.map(({ kljuc, naziv, Ikona }) => (
                        <button
                            key={kljuc}
                            type="button"
                            className={`${styles.stavka} ${sekcija === kljuc ? styles.stavkaOn : ''}`}
                            onClick={() => setSekcija(kljuc)}
                            aria-current={sekcija === kljuc ? 'page' : undefined}
                        >
                            <Ikona size={17} />
                            {naziv}
                        </button>
                    ))}
                </nav>

                <div className={styles.dno}>
                    <span className={styles.vlasnik}>vlasnik · {korisnik.ime}</span>
                    <button type="button" className={styles.odjava} onClick={logout}>ODJAVA</button>
                </div>
            </aside>

            <main className={styles.glavni}>
                {sekcija === 'MENI' ? <AdminMeni />
                    : sekcija === 'RADNO_VREME' ? <AdminRadnoVreme />
                    : sekcija === 'ZAPOSLENI' ? <AdminZaposleni />
                    : sekcija === 'KORISNICI' ? <AdminKorisnici />
                    : sekcija === 'PORUDZBINE' ? <AdminPorudzbine />
                    : <Uskoro naziv={SEKCIJE.find(s => s.kljuc === sekcija)!.naziv} />}
            </main>
        </div>
    );
}

/** Sekcija koja još nije napravljena — panel se gradi po fazama. */
function Uskoro({ naziv }: { naziv: string }) {
    return (
        <div className={styles.uskoro}>
            <span className={styles.uskoroEyeb}>još radimo na tome</span>
            <h1 className={styles.naslov}>{naziv.charAt(0) + naziv.slice(1).toLowerCase()}</h1>
            <p className={styles.uskoroTekst}>Ova sekcija još nije napravljena.</p>
        </div>
    );
}
