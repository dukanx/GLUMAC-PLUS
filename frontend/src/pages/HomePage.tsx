import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ReactNode, CSSProperties } from 'react';
import { motion } from 'motion/react';
import styles from './HomePage.module.css';
import logoDark from '../assets/logoDark.png';
import gpWhite from '../assets/GPwhiteNOBG.png';
import glovoLogo from '../assets/glovo.png';
import woltLogo from '../assets/wolt.png';
import maskota from '../assets/maskota.png';
import deliveryDoodle from '../assets/DeliveryDoodle.png';
import orderDoodle from '../assets/OrderDoodle.png';
import bg from '../assets/bg.png';
import bg1 from '../assets/bg1.png';
import CrtaniOkvir from '../components/CrtaniOkvir';
import { Klose } from '../components/Doodle';
import { flyToCart } from '../utils/flyToCart';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useRadnoVreme } from '../hooks/useRadnoVreme';
import type { Proizvod } from '../types/proizvod';
import * as proizvodiApi from '../api/proizvodi';

const GLOVO_URL = 'https://glovoapp.com/en/rs/belgrade/stores/glumac-plus-beg';
const WOLT_URL = 'https://wolt.com/en/srb/belgrade/restaurant/palainkarnica-glumac-plus';
const MAPS_URL = 'https://www.google.com/maps/place/Glumac+plus/data=!4m2!3m1!1s0x0:0xb7899385a5114972?sa=X&ved=1t:2428&ictx=111';
const SLOGAN = '— sveže, brzo, u srcu Dorćola —';

const MARQUEE = [
    'Nutella Plazma', 'Glumac palačinka', 'Specijalni kremovi', 'Šunka kačkavalj',
    'Palačinka piletina', 'Pohovani meni', 'Giros',
];

const RECENZIJE = [
    { tekst: 'Najbolje palačinke u gradu, bez konkurencije. Glumac palačinka je obavezna.', ime: 'Marko J.', varijantaB: false },
    { tekst: 'Uvek sveže, uvek brzo. Osoblje super ljubazno, a lokal ima dušu.', ime: 'Jelena P.', varijantaB: true },
    { tekst: 'Dolazim godinama, još od stare lokacije. Kvalitet nikad nije pao.', ime: 'Nikola S.', varijantaB: false },
];

// Scroll-reveal omotač (dizajnov .rvl efekat)
function Rvl({ children, delay = 0, className, style }: {
    children: ReactNode; delay?: number; className?: string; style?: CSSProperties;
}) {
    return (
        <motion.div
            className={className}
            style={style}
            initial={{ opacity: 0, y: 48, scale: 0.965 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}

// Talasasti separator u marquee traci
function MarqX() {
    return (
        <svg className={styles.marqX} viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M2 12 C 5 6, 8 16, 11 9 C 13 5, 16 13, 18 9"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
    );
}

// Puna zvezdica (Google ocena)
function ZvezdaPuna() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
        </svg>
    );
}

// Radno vreme u kontakt bloku — grupiše uzastopne dane sa istim vremenom
function RadnoVreme() {
    const { raspored, loading, imaPodataka } = useRadnoVreme();

    if (loading) return <p className={styles.rvVr}>učitavam…</p>;
    if (!imaPodataka) return <p className={styles.rvVr}>privremeno nedostupno</p>;

    const grupe: { od: string; do_: string; vreme: string | null }[] = [];
    for (const dan of raspored) {
        const poslednja = grupe[grupe.length - 1];
        if (poslednja && poslednja.vreme === dan.vreme) {
            poslednja.do_ = dan.skracenica;
        } else {
            grupe.push({ od: dan.skracenica, do_: dan.skracenica, vreme: dan.vreme });
        }
    }

    return (
        <>
            {grupe.map((g, i) => (
                <div key={i} className={styles.rvRow}>
                    <span className={styles.rvDan}>
                        {g.od === g.do_ ? g.od : `${g.od} – ${g.do_}`}
                    </span>
                    <span className={styles.rvVr}>{g.vreme ?? 'zatvoreno'}</span>
                </div>
            ))}
        </>
    );
}

export default function HomePage() {
    const { korisnik, loyaltyProgrami, popust } = useAuth();
    const { dodaj } = useCart();
    const { danas } = useRadnoVreme();
    const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
    const [tipOtvoren, setTipOtvoren] = useState<number | null>(null);

    useEffect(() => {
        proizvodiApi.getSvi()
            .then(setProizvodi)
            .catch(() => setProizvodi([]));
    }, []);

    // Preporuke — prvih 5 proizvoda iz kataloga (opis je opcion, ide u hover tooltip)
    const preporuke = useMemo(
        () => proizvodi.slice(0, 5),
        [proizvodi]
    );

    // Loyalty nivoi sortirani po pragu (sa backenda)
    const nivoi = useMemo(
        () => [...loyaltyProgrami].sort((a, b) => a.pragBodova - b.pragBodova),
        [loyaltyProgrami]
    );

    const sledeciNivo = korisnik
        ? nivoi.find(n => n.pragBodova > korisnik.brojBodova)
        : undefined;

    const progresDo = sledeciNivo && korisnik
        ? Math.min(100, Math.round(korisnik.brojBodova / sledeciNivo.pragBodova * 100))
        : 100;

    const danasVreme = danas?.vreme ?? null;

    return (
        <div className={styles.pg}>

            {/* Zavese — uvodna animacija */}
            <div className={styles.zavese} aria-hidden="true">
                <svg className={`${styles.zavPola} ${styles.zavL}`} viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="zavNab" x1="0" y1="0" x2="0.16" y2="0" spreadMethod="repeat">
                            <stop offset="0" stopColor="hsl(358 62% 25%)" />
                            <stop offset="0.3" stopColor="hsl(358 68% 35%)" />
                            <stop offset="0.55" stopColor="hsl(358 62% 23%)" />
                            <stop offset="0.8" stopColor="hsl(358 66% 31%)" />
                            <stop offset="1" stopColor="hsl(358 62% 25%)" />
                        </linearGradient>
                        <linearGradient id="zavSen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="hsl(358 70% 10%)" stopOpacity=".45" />
                            <stop offset="0.22" stopColor="hsl(358 70% 10%)" stopOpacity="0" />
                            <stop offset="0.72" stopColor="hsl(358 70% 8%)" stopOpacity="0" />
                            <stop offset="1" stopColor="hsl(358 70% 8%)" stopOpacity=".55" />
                        </linearGradient>
                    </defs>
                    <path d="M0 0 L97 0 C 92 10, 97 21, 92 33 C 88 45, 97 55, 92 67 C 88 79, 96 89, 93 100 L 84 100 C 81 93.5, 73 93.5, 70 100 L 54 100 C 51 93.5, 43 93.5, 40 100 L 24 100 C 21 94.5, 13 94.5, 10 100 L 0 100 Z" fill="url(#zavNab)" />
                    <path d="M0 0 L97 0 C 92 10, 97 21, 92 33 C 88 45, 97 55, 92 67 C 88 79, 96 89, 93 100 L 84 100 C 81 93.5, 73 93.5, 70 100 L 54 100 C 51 93.5, 43 93.5, 40 100 L 24 100 C 21 94.5, 13 94.5, 10 100 L 0 100 Z" fill="url(#zavSen)" />
                </svg>
                <svg className={`${styles.zavPola} ${styles.zavR}`} viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M100 0 L3 0 C 8 10, 3 21, 8 33 C 12 45, 3 55, 8 67 C 12 79, 4 89, 7 100 L 16 100 C 19 93.5, 27 93.5, 30 100 L 46 100 C 49 93.5, 57 93.5, 60 100 L 76 100 C 79 94.5, 87 94.5, 90 100 L 100 100 Z" fill="url(#zavNab)" />
                    <path d="M100 0 L3 0 C 8 10, 3 21, 8 33 C 12 45, 3 55, 8 67 C 12 79, 4 89, 7 100 L 16 100 C 19 93.5, 27 93.5, 30 100 L 46 100 C 49 93.5, 57 93.5, 60 100 L 76 100 C 79 94.5, 87 94.5, 90 100 L 100 100 Z" fill="url(#zavSen)" />
                </svg>
            </div>

            {/* ── Hero ── */}
            <section className={styles.hero}>
                <svg className={styles.heroDoodle} style={{ top: 60, left: '9%', width: 90, transform: 'rotate(-16deg)' }} viewBox="0 0 100 60" fill="none"><path d="M6 50 C 30 10, 62 8, 90 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /><path d="M78 18 L 91 26 L 79 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                <svg className={styles.heroDoodle} style={{ top: 96, right: '8%', width: 64, color: 'var(--rust)', transform: 'rotate(12deg)' }} viewBox="0 0 60 60" fill="none"><path d="M30 4 L 34 24 L 54 28 L 34 32 L 30 54 L 26 32 L 6 28 L 26 24 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" /></svg>
                <svg className={styles.heroDoodle} style={{ bottom: 120, left: '14%', width: 70 }} viewBox="0 0 80 30" fill="none"><path d="M4 18 C 18 6, 28 26, 42 14 C 54 4, 64 22, 76 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
                <svg className={styles.heroDoodle} style={{ top: 110, left: '24%', width: 34, color: 'var(--rust)', opacity: .7, transform: 'rotate(14deg)' }} viewBox="0 0 40 40" fill="none"><path d="M20 4 C 20.5 14, 19.5 26, 20 36 M4 20 C 14 19.5, 26 20.5, 36 20" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>
                <svg className={styles.heroDoodle} style={{ top: 84, right: '22%', width: 46, transform: 'rotate(-10deg)' }} viewBox="0 0 50 50" fill="none"><path d="M25 4 L 27 18 M25 46 L 23 32 M4 25 L 18 27 M46 25 L 32 23" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
                <svg className={styles.heroDoodle} style={{ bottom: 150, right: '15%', width: 56, transform: 'rotate(6deg)' }} viewBox="0 0 60 60" fill="none"><path d="M30 30 C 30 24, 38 24, 38 30 C 38 38, 24 38, 24 29 C 24 18, 42 18, 43 30 C 44 44, 20 46, 17 30 C 14 12, 44 8, 50 26" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" /></svg>
                <svg className={styles.heroDoodle} style={{ bottom: 60, left: '28%', width: 26, color: 'var(--rust)', opacity: .6, transform: 'rotate(-18deg)' }} viewBox="0 0 40 40" fill="none"><path d="M20 6 L 22 16 L 33 20 L 22 24 L 20 34 L 18 24 L 7 20 L 18 16 Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" /></svg>
                <svg className={styles.heroDoodle} style={{ bottom: 56, right: '19%', width: 44, opacity: .75, transform: 'rotate(-8deg)' }} viewBox="0 0 60 70" fill="none"><path d="M12 20 C 15 10, 30 5, 44 8 C 52 10, 54 17, 48 21" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /><path d="M12 20 C 21 15, 39 14, 48 21 L 31 63 C 30 65.5, 29.5 65.5, 28.5 63 Z" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" /><path d="M26 31 L 33 31 M29 41 L 35 41 M28 51 L 32 51" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>

                {/* Mali doodlovi samo za mobilni (dooMob) — veliki su na mobilnom skriveni */}
                <svg className={styles.dooMob} style={{ top: 44, left: '10%', width: 30, color: 'var(--rust)', opacity: .6, transform: 'rotate(12deg)' }} viewBox="0 0 40 40" fill="none"><path d="M20 4 C 20.5 14, 19.5 26, 20 36 M4 20 C 14 19.5, 26 20.5, 36 20" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" /></svg>
                <svg className={styles.dooMob} style={{ top: 40, right: '10%', width: 24, transform: 'rotate(-14deg)' }} viewBox="0 0 40 40" fill="none"><path d="M20 6 L 22 16 L 33 20 L 22 24 L 20 34 L 18 24 L 7 20 L 18 16 Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" /></svg>
                <svg className={styles.dooMob} style={{ top: '46%', left: '6%', width: 30, color: 'var(--rust)', opacity: .5, transform: 'rotate(10deg)' }} viewBox="0 0 60 54" fill="none"><path d="M30 48 C 8 32, 4 16, 14 9 C 22 4, 29 10, 30 16 C 31 10, 38 4, 46 9 C 56 16, 52 32, 30 48 Z" stroke="currentColor" strokeWidth="2.8" strokeLinejoin="round" /></svg>
                <svg className={styles.dooMob} style={{ top: '41%', right: '7%', width: 34, color: 'var(--ink40)', opacity: .55, transform: 'rotate(-6deg)' }} viewBox="0 0 60 60" fill="none"><path d="M32 30 C 32 25, 39 25, 39 31 C 39 39, 26 39, 26 29 C 26 17, 43 17, 43 32 C 43 47, 22 48, 20 31" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>
                <svg className={styles.dooMob} style={{ bottom: 120, left: '9%', width: 34, color: '#FFC244', opacity: .8, transform: 'rotate(-10deg)' }} viewBox="0 0 60 60" fill="none"><path d="M30 6 L 33 26 L 52 30 L 33 34 L 30 54 L 27 34 L 8 30 L 27 26 Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" /></svg>

                <span className={styles.estUgao}>
                    est. 2000
                    <svg viewBox="0 0 100 10" fill="none" preserveAspectRatio="none"><path d="M3 6 C 30 3, 70 8, 97 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
                </span>

                <span className={styles.skrolDole}>
                    <svg viewBox="0 0 40 58" fill="none"><path d="M20 3 C 32 5, 33 19, 21 20 C 12 20.5, 12 11, 20 11.5 C 31 12.5, 27 33, 22 48" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" /><path d="M13 40 L 22 50 L 30 39" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>

                {/* Polaroidi */}
                <div className={styles.hfL}>
                    <span className={styles.tape} />
                    <img src={bg} alt="Palačinke" />
                    <span className={styles.hfCap}>sveže sa plotne ♥</span>
                </div>
                <div className={styles.hfR}>
                    <span className={styles.tape} />
                    <img src={bg1} alt="Palačinke" />
                    <span className={styles.hfCap}>klasika ☺</span>
                </div>

                {/* Mobilni okvir + est. */}
                <svg className={styles.heroOkvir} viewBox="0 0 390 700" fill="none" preserveAspectRatio="none"><rect x="6" y="6" width="378" height="688" rx="26" stroke="currentColor" strokeWidth="2.5" strokeDasharray="14 11" /></svg>
                <span className={styles.estMob}>
                    est. 2000
                    <svg viewBox="0 0 100 10" fill="none" preserveAspectRatio="none"><path d="M3 6 C 30 3, 70 8, 97 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
                </span>

                <img src={logoDark} alt="Glumac Plus" className={styles.heroLogo} />
                <h1 className={styles.heroH1}>
                    Palačinke koje te<br />
                    <span className={`${styles.rust} ${styles.krug}`}>
                        stvarno zasite.
                        <svg className={styles.zasPod} viewBox="0 0 200 24" preserveAspectRatio="none"><path d="M6 14 C 40 7, 90 4, 140 6 C 165 7, 185 9, 195 12 C 170 11, 120 11, 70 14 C 40 16, 18 17, 8 16 Z" fill="currentColor" opacity=".6" /></svg>
                    </span>
                </h1>
                <p className={styles.heroLede}>{SLOGAN}</p>

                <div className={styles.heroCtas}>
                    <Link to="/meni" className={styles.ctaVel}>
                        <svg className={styles.ctaIko} viewBox="0 0 80 80" fill="none"><path d="M40 24 L 40 72" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /><path d="M33 8 L 33 20 M40 6 L 40 20 M47 8 L 47 20" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" /><path d="M33 20 C 33 27, 47 27, 47 20" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" fill="none" /><path d="M24 46 L 8 46 C 6 42, 8 37, 13 37 L 24 37 Z" stroke="currentColor" strokeWidth="3.6" strokeLinejoin="round" /><path d="M24 41.5 L 72 41.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>
                        Poruči odmah
                    </Link>
                    <Link to="/loyalty" className={styles.hbtn}>
                        Loyalty program{' '}
                        <svg style={{ width: 17, height: 17, verticalAlign: -2 }} viewBox="0 0 60 60" fill="none"><path d="M30 6 L 34 24 L 52 28 L 34 33 L 30 52 L 26 33 L 8 28 L 26 24 Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" /></svg>
                    </Link>
                    <span className={styles.ctaStrel}>
                        <svg width="52" height="46" viewBox="0 0 60 54" fill="none"><path d="M52 4 C 46 24, 34 38, 16 46" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" /><path d="M24 46 L 14 47 L 19 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                    </span>
                </div>

                {/* Mobilni "poruči" blok */}
                <div className={styles.hpBlok}>
                    <h1 className={styles.hpH}>
                        Palačinke koje te<br />
                        <span className={`${styles.rust} ${styles.krug}`}>
                            stvarno zasite.
                            <svg className={styles.zasPod} viewBox="0 0 200 24" preserveAspectRatio="none"><path d="M6 14 C 40 7, 90 4, 140 6 C 165 7, 185 9, 195 12 C 170 11, 120 11, 70 14 C 40 16, 18 17, 8 16 Z" fill="currentColor" opacity=".6" /></svg>
                        </span>
                    </h1>
                    <div className={styles.hpKart}>
                        <span className={styles.tape} />
                        <p className={styles.hpKor}>poruči online — preuzmi u lokalu</p>
                        <Link to="/meni" className={`${styles.hbtnPun} ${styles.hpGlavni}`}>
                            Meni
                            <svg className={styles.ctaIko} viewBox="0 0 60 70" fill="none"><path d="M10 8 C 24 4, 38 4, 50 8 L 48 62 C 36 66, 24 66, 12 62 Z" stroke="currentColor" strokeWidth="3.2" strokeLinejoin="round" /><path d="M20 24 L 40 24 M20 34 L 42 34 M20 44 L 36 44" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" /></svg>
                        </Link>
                        <Link to="/loyalty" className={`${styles.hbtn} ${styles.hpLoy}`}>
                            Loyalty program{' '}
                            <svg style={{ width: 16, height: 16, verticalAlign: -2 }} viewBox="0 0 60 60" fill="none"><path d="M30 6 L 34 24 L 52 28 L 34 33 L 30 52 L 26 33 L 8 28 L 26 24 Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" /></svg>
                        </Link>
                        <div className={styles.hpInfo}>
                            <span>{danasVreme ? `danas ${danasVreme}` : 'danas zatvoreno'}</span>
                            <span className={styles.hiSep}>·</span>
                            <span>Dorćol, Beograd</span>
                        </div>
                    </div>
                    <div className={styles.hpDostRed}>
                        <img src={deliveryDoodle} alt="dostava" className={styles.hpDostLab} />
                        <a className={`${styles.hpDost} ${styles.hpDostG}`} href={GLOVO_URL} target="_blank" rel="noopener noreferrer">
                            <img src={glovoLogo} alt="Glovo" />
                        </a>
                        <a className={`${styles.hpDost} ${styles.hpDostW}`} href={WOLT_URL} target="_blank" rel="noopener noreferrer">
                            <img src={woltLogo} alt="Wolt" />
                        </a>
                    </div>
                    <a className={styles.hpKontInfo} href="#kontakt">
                        kontakt i info
                        <svg viewBox="0 0 30 40" fill="none" style={{ width: 13, height: 17, marginLeft: 6, verticalAlign: -3 }}><path d="M13 4 C 18 12, 19 22, 15 33" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /><path d="M8 26 L 15 34 L 23 27" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </a>
                </div>
            </section>

            {/* ── Marquee ── */}
            <div className={styles.marq} aria-hidden="true">
                <div className={styles.marqIn}>
                    {[...MARQUEE, ...MARQUEE].map((m, i) => (
                        <span key={i} style={{ display: 'inline-flex', gap: 36, alignItems: 'center' }}>
                            {m}<MarqX />
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Dostava ── */}
            <section className={`${styles.sec} ${styles.secDost}`}>
                <div className={styles.split}>
                    <div className={styles.dLevo}>
                        <span className={styles.eyeb}>Naručite online</span>
                        <h2 className={styles.h2}>Dostava na<br /><span className={`${styles.rust} ${styles.brushHi}`}>vašu adresu.</span></h2>
                        <img src={deliveryDoodle} alt="" className={styles.dostDoodle} />
                        <div className={styles.dkarte}>
                            <Rvl className={styles.dkart}>
                                <CrtaniOkvir kasnjenje={0.1} />
                                <img src={glovoLogo} alt="Glovo" className={styles.dlogo} />
                                <a href={GLOVO_URL} target="_blank" rel="noopener noreferrer" className={styles.gbtn}>Poruči →</a>
                            </Rvl>
                            <Rvl delay={0.15} className={styles.dkR}>
                                <CrtaniOkvir kasnjenje={0.25} />
                                <img src={woltLogo} alt="Wolt" className={styles.dlogo} />
                                <a href={WOLT_URL} target="_blank" rel="noopener noreferrer" className={styles.wbtn}>Poruči →</a>
                            </Rvl>
                        </div>
                    </div>
                    <div className={styles.dDesno}>
                        <img src={orderDoodle} alt="" className={styles.orderDoodle} />
                        <span className={styles.eyeb}>Ili poruči kod nas</span>
                        <ol className={styles.uspLista}>
                            <Rvl>
                                <li className={styles.uspRow}>
                                    <em className={styles.uspBr}>1.</em>
                                    <div>
                                        <h3 className={styles.uspH}>Poruči direktno</h3>
                                        <p className={styles.uspP}>Online narudžbina kroz sajt — bodovi se automatski pripisuju.</p>
                                    </div>
                                </li>
                            </Rvl>
                            <Rvl delay={0.15}>
                                <li className={styles.uspRow}>
                                    <em className={styles.uspBr}>2.</em>
                                    <div>
                                        <h3 className={styles.uspH}>Preuzmi uživo</h3>
                                        <p className={styles.uspP}>Dođi po porudžbinu u lokal — uvek sveža, gotova na vreme.</p>
                                    </div>
                                </li>
                            </Rvl>
                            <Rvl delay={0.3}>
                                <li className={styles.uspRow}>
                                    <em className={styles.uspBr}>3.</em>
                                    <div>
                                        <h3 className={styles.uspH}>Skupljaj bodove</h3>
                                        <p className={styles.uspP}>Svaka porudžbina donosi loyalty bodove i popuste.</p>
                                    </div>
                                </li>
                            </Rvl>
                        </ol>
                        <div className={styles.dostCtas}>
                            <Link to="/meni" className={styles.hbtnPun} style={{ fontSize: 24 }}>Poruči sada →</Link>
                            <Link to="/loyalty" className={styles.dostLoyLink}>Loyalty program →</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Preporuke ── */}
            {preporuke.length > 0 && (
                <section className={styles.menu}>
                    <svg className={`${styles.doodle} ${styles.dooKarta}`} style={{ top: 40, left: '3%', width: 60, transform: 'rotate(-10deg)' }} viewBox="0 0 80 80" fill="none"><path d="M40 24 L 40 72" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /><path d="M33 8 L 33 20 M40 6 L 40 20 M47 8 L 47 20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /><path d="M33 20 C 33 27, 47 27, 47 20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" /><path d="M24 46 L 8 46 C 6 42, 8 37, 13 37 L 24 37 Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" /><path d="M24 41.5 L 72 41.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
                    {/* Doodlovi levo/desno od karte, na sredini između margine i karte
                        (calc(25% − 295px) ≈ polovina razmaka; samo šire širine). */}
                    {/* — leva strana — */}
                    <svg className={`${styles.doodle} ${styles.dooStran}`} style={{ top: '15%', left: 'calc(25% - 295px)', width: 56, color: 'var(--rust)', opacity: .7, transform: 'rotate(-8deg)' }} viewBox="0 0 60 60" fill="none"><path d="M8 8 C 20 3, 40 3, 52 8 C 54 22, 50 42, 30 52 C 10 42, 6 22, 8 8 Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" /><path d="M20 34 C 25 40, 35 40, 40 34" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                    <svg className={`${styles.doodle} ${styles.dooStran}`} style={{ top: '45%', left: 'calc(25% - 295px)', width: 52, opacity: .6, transform: 'rotate(7deg)' }} viewBox="0 0 60 60" fill="none"><path d="M12 24 L 44 24 L 41 50 C 40 56, 16 56, 15 50 Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" /><path d="M44 30 C 54 30, 54 42, 44 42" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" /><path d="M23 8 C 21 12, 27 14, 25 18 M33 8 C 31 12, 37 14, 35 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                    <svg className={`${styles.doodle} ${styles.dooStran}`} style={{ bottom: '13%', left: 'calc(25% - 295px)', width: 46, color: 'var(--rust)', opacity: .6, transform: 'rotate(-12deg)' }} viewBox="0 0 60 60" fill="none"><path d="M30 6 L 33 26 L 52 30 L 33 34 L 30 54 L 27 34 L 8 30 L 27 26 Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" /></svg>
                    {/* — desna strana — */}
                    <svg className={`${styles.doodle} ${styles.dooStran}`} style={{ top: '20%', right: 'calc(25% - 295px)', width: 54, opacity: .6, transform: 'rotate(8deg)' }} viewBox="0 0 60 60" fill="none"><path d="M32 30 C 32 25, 39 25, 39 31 C 39 39, 26 39, 26 29 C 26 17, 43 17, 43 32 C 43 47, 22 48, 20 31" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
                    <svg className={`${styles.doodle} ${styles.dooStran}`} style={{ top: '50%', right: 'calc(25% - 295px)', width: 52, color: 'var(--rust)', opacity: .65, transform: 'rotate(-6deg)' }} viewBox="0 0 60 54" fill="none"><path d="M30 48 C 8 32, 4 16, 14 9 C 22 4, 29 10, 30 16 C 31 10, 38 4, 46 9 C 56 16, 52 32, 30 48 Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" /></svg>
                    <svg className={`${styles.doodle} ${styles.dooStran}`} style={{ bottom: '16%', right: 'calc(25% - 295px)', width: 50, opacity: .55, transform: 'rotate(6deg)' }} viewBox="0 0 80 30" fill="none"><path d="M4 18 C 18 6, 28 26, 42 14 C 54 4, 64 22, 76 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
                    <div className={styles.mwrap}>
                        <span className={styles.eyeb}>Karta</span>
                        <h2 className={styles.h2}>Naše preporuke.</h2>
                        <svg className={styles.pod} viewBox="0 0 220 12" fill="none"><path d="M3 8 C 50 3, 110 10, 217 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
                        <p className={styles.mtipHint}>klikni na palačinku za sastojke ☺</p>
                        <div style={{ marginTop: 16 }}>
                            {preporuke.map((p, i) => (
                                <Rvl key={p.id}>
                                    <div
                                        className={`${styles.mrow} ${tipOtvoren === i ? styles.mtipOn : ''}`}
                                        onClick={() => setTipOtvoren(t => t === i ? null : i)}
                                    >
                                        {p.opis && <span className={styles.mtip}>{p.opis}</span>}
                                        <span className={styles.mnum}>{String(i + 1).padStart(2, '0')}</span>
                                        <h3 className={styles.mnaz}>{p.naziv}</h3>
                                        <span className={styles.mdots} />
                                        <span className={styles.mcena}>
                                            {Math.round(p.cena)}<span className={styles.mrsd}>RSD</span>
                                        </span>
                                        <button
                                            className={styles.mplus}
                                            onClick={e => { e.stopPropagation(); dodaj(p); flyToCart(e.currentTarget); }}
                                            aria-label={`Dodaj ${p.naziv}`}
                                        >
                                            +
                                        </button>
                                        <span className={styles.mpop} aria-hidden="true">
                                            <span className={styles.mpopImg}><Klose size={44} strokeWidth={1.5} /></span>
                                        </span>
                                    </div>
                                </Rvl>
                            ))}
                        </div>
                        <div className={styles.mfoot}>
                            <span>Cela karta u meniju — preko 40 vrsta.</span>
                            <Link to="/meni" className={styles.mfootBtn}>Otvori meni →</Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ── O nama ── */}
            <section className={styles.onama}>
                <svg className={styles.doodle} style={{ top: 44, right: '5%', width: 60, color: 'var(--rust)', opacity: .7 }} viewBox="0 0 70 70" fill="none"><circle cx="35" cy="35" r="13" stroke="currentColor" strokeWidth="2.4" /><path d="M35 6 L 35 14 M35 56 L 35 64 M6 35 L 14 35 M56 35 L 64 35 M14 14 L 20 20 M50 50 L 56 56 M56 14 L 50 20 M20 50 L 14 56" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
                <span className={styles.eyeb}>Priča</span>
                <h2 className={styles.h2}>Novi ambijent, <span className={`${styles.rust} ${styles.brushHi}`}>stari recepti.</span></h2>
                <div className={styles.onGrid}>
                    <div className={styles.onLevo}>
                        <p className={styles.onFirst}>Glumac Plus je mesto gde se palačinka shvata ozbiljno.</p>
                        <p className={styles.onP}>Nema kompromisa oko kvaliteta — svaka kombinacija se bira pažljivo, svaki detalj se pravi sa ciljem. Naš meni se menjao godinama, ali princip ostaje isti — dobra hrana, brzo, bez gužve.</p>
                        <p className={styles.onP}>Nalazimo se u srcu Dorćola, u crnom lokalu koji se ne može promašiti.</p>
                        <div style={{ marginTop: 14 }}>
                            <p className={styles.onQuote}>„Glamur nije u dekoraciji. U zalogaju je."</p>
                            <svg className={styles.pod} viewBox="0 0 220 12" fill="none"><path d="M3 8 C 50 3, 110 10, 217 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
                        </div>
                        <div className={styles.stats}>
                            <Rvl className={styles.stat}><span className={styles.statV}>2000</span><span className={styles.statL}>godina otvaranja</span></Rvl>
                            <Rvl delay={0.15} className={styles.statB}><span className={styles.statV}>40+</span><span className={styles.statL}>vrsta u ponudi</span></Rvl>
                            <Rvl delay={0.15} className={styles.stat}><span className={`${styles.statV} ${styles.rust}`}>Dorćol</span><span className={styles.statL}>naša četvrt</span></Rvl>
                            <Rvl delay={0.3} className={styles.statB}><span className={styles.statV}>7/7</span><span className={styles.statL}>dana otvoreni</span></Rvl>
                        </div>
                    </div>
                    <div className={`${styles.polaTri} ${styles.onGridPolaTri}`}>
                        <Rvl className={styles.pola} style={{ transform: 'rotate(-6.5deg)' }}>
                            <span className={styles.tape} />
                            <div className={styles.polaSlot}><img src={bg} alt="Prva lokacija" /></div>
                            <span className={styles.polaCap}>prva lokacija</span>
                        </Rvl>
                        <Rvl delay={0.15} className={`${styles.pola} ${styles.pol2}`} style={{ transform: 'rotate(6deg)' }}>
                            <span className={styles.tape} />
                            <div className={styles.polaSlot}><img src={bg1} alt="Druga lokacija" /></div>
                            <span className={styles.polaCap}>druga lokacija</span>
                        </Rvl>
                        <Rvl delay={0.3} className={`${styles.pola} ${styles.pol3}`} style={{ transform: 'rotate(-5deg)' }}>
                            <span className={styles.tape} />
                            <div className={styles.polaSlot}><img src={bg} alt="Dorćol danas" /></div>
                            <span className={styles.polaCap}>Dorćol, danas ♥</span>
                        </Rvl>
                    </div>
                </div>
                <img src={maskota} alt="" className={styles.maskota} />
            </section>

            {/* ── Loyalty tabla ── */}
            <section className={styles.tabla}>
                <svg className={styles.doodle} style={{ top: 44, right: '7%', width: 58, color: '#FFC244', opacity: .85, transform: 'rotate(8deg)' }} viewBox="0 0 60 60" fill="none"><path d="M8 8 C 20 3, 40 3, 52 8 C 54 22, 50 42, 30 52 C 10 42, 6 22, 8 8 Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" /><path d="M16 22 C 19 19, 23 19, 26 22 M34 22 C 37 19, 41 19, 44 22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /><path d="M20 35 C 25 41, 35 41, 40 35" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                <div className={styles.split}>
                    <div>
                        <span className={styles.eyeb}>Loyalty program</span>
                        <h2 className={styles.h2}>Nagrađujemo<br /><span className={`${styles.rust} ${styles.brushHi}`}>vernost.</span></h2>
                        <p className={styles.tablaOpis}>
                            Svaka porudžbina donosi bodove. Više bodova — veći popust.
                            Naš najviši nivo nosi naziv koji zaslužuje.
                        </p>
                        <Link to="/loyalty" className={styles.tbtn}>
                            {korisnik ? 'Pogledaj svoj status →' : 'Saznaj više →'}
                        </Link>
                    </div>
                    <div>
                        <Rvl>
                            <div className={styles.loyKart}>
                                <span className={styles.tapeZ} style={{ left: '26%' }} />
                                <div className={styles.loyKHRed}>
                                    <span className={styles.loyKH}>Loyalty kartica</span>
                                    <span className={styles.loyBr}>
                                        {korisnik ? `br. ${String(korisnik.id).padStart(4, '0')}` : 'tvoja buduća kartica'}
                                    </span>
                                </div>
                                <div className={styles.loyBod}>
                                    <span className={styles.loyBodV}>{korisnik?.brojBodova ?? 0}</span>
                                    <span className={styles.loyBodL}>bodova</span>
                                    {korisnik?.loyaltyNivo && (
                                        <span className={styles.loyBodNiv}>· {korisnik.loyaltyNivo}</span>
                                    )}
                                </div>
                                <div className={styles.loyProg}>
                                    <div className={styles.loyProgFill} style={{ width: `${korisnik ? progresDo : 0}%` }} />
                                </div>
                                <p className={styles.loyProgTxt}>
                                    {korisnik && sledeciNivo
                                        ? <>još {sledeciNivo.pragBodova - korisnik.brojBodova} bodova do — <b>{sledeciNivo.nivo}</b></>
                                        : korisnik
                                            ? <>na najvišem si nivou ♥</>
                                            : <>registruj se i počni da skupljaš</>}
                                </p>
                                <p className={styles.loyKF}>svaka porudžbina donosi bodove</p>
                                {popust > 0 && (
                                    <div className={styles.loyPecat}><b>−{popust}%</b><span>popusta</span></div>
                                )}
                            </div>
                        </Rvl>
                        {nivoi.length > 0 && (
                            <div className={styles.loyNivRow}>
                                {nivoi.map((n, i) => (
                                    <Rvl key={n.id} delay={i * 0.1} className={`${styles.loyNiv} ${i === nivoi.length - 1 ? styles.kZut : ''}`}>
                                        <span className={styles.loyNivKrug}>
                                            <svg viewBox="0 0 80 80" fill="none"><path d="M40 6 C 62 4, 76 18, 74 40 C 72 62, 58 75, 38 74 C 16 73, 5 58, 6 38 C 7 18, 22 8, 44 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
                                            <em>{n.popust}%</em>
                                        </span>
                                        <p className={styles.loyNivN}>{n.nivo}</p>
                                        <p className={styles.loyNivB}>{n.pragBodova.toLocaleString('sr-RS')} bodova</p>
                                    </Rvl>
                                ))}
                            </div>
                        )}
                        <p className={styles.loyPS}>p.s. glavna uloga se zaslužuje ♥</p>
                    </div>
                </div>
            </section>

            {/* ── Galerija ── */}
            <section>
                <div className={styles.galIntro}>
                    <span className={styles.eyeb}>Naš lokal</span>
                    <h2 className={styles.h2}>Dođi, vidi, <span className={`${styles.rust} ${styles.brushHi}`}>ostani.</span></h2>
                    <svg className={styles.doodle} style={{ top: 40, right: '13%', width: 54, color: 'var(--rust)', transform: 'rotate(-8deg)' }} viewBox="0 0 60 66" fill="none"><path d="M30 4 C 17 4, 8 13, 8 26 C 8 42, 30 62, 30 62 C 30 62, 52 42, 52 26 C 52 13, 43 4, 30 4 Z" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" /><circle cx="30" cy="25" r="8" stroke="currentColor" strokeWidth="2.4" /></svg>
                    <p className={styles.galZaviri}>— zaviri unutra ↓</p>
                </div>
                <div className={styles.gal}>
                    {[
                        { slika: bg, cap: '01 · ambijent', rot: -2.5, tape: styles.tape, top: 0 },
                        { slika: bg1, cap: '02 · slatke', rot: 1.8, tape: styles.tapeZ, top: 28 },
                        { slika: bg, cap: '03 · sveže', rot: -1.4, tape: styles.tapeP, top: 0 },
                        { slika: bg1, cap: '04 · detalji', rot: 2.2, tape: styles.tape, top: 36 },
                    ].map((g, i) => (
                        <Rvl
                            key={i}
                            delay={i * 0.1}
                            className={styles.galIt}
                            style={{ transform: `rotate(${g.rot}deg)`, marginTop: g.top }}
                        >
                            <span className={g.tape} />
                            <div className={styles.galSlot}><img src={g.slika} alt={g.cap} /></div>
                            <span className={styles.galCap}>{g.cap}</span>
                        </Rvl>
                    ))}
                </div>
                <p className={styles.galNote}>p.s. dođi gladan ♥</p>
            </section>

            {/* ── Recenzije ── */}
            <section className={styles.rec}>
                <svg className={styles.doodle} style={{ top: 44, right: '7%', width: 56, color: 'var(--rust)', opacity: .8, transform: 'rotate(6deg)' }} viewBox="0 0 64 56" fill="none"><path d="M8 12 C 8 8, 12 6, 18 6 L 46 6 C 52 6, 56 8, 56 13 L 56 30 C 56 35, 52 37, 46 37 L 26 37 L 15 48 L 16 37 C 11 36, 8 34, 8 30 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" /><path d="M20 18 L 44 18 M20 26 L 38 26" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                <div className={styles.recHead}>
                    <div>
                        <span className={styles.eyeb}>Google recenzije</span>
                        <h2 className={styles.h2}>Šta kažu <span className={`${styles.rust} ${styles.brushHi}`}>gosti.</span></h2>
                    </div>
                    <div className={styles.recOc}>
                        <span className={styles.recBr}>4.5</span>
                        <div>
                            <div className={styles.zvez}>
                                <ZvezdaPuna /><ZvezdaPuna /><ZvezdaPuna /><ZvezdaPuna />
                                <svg viewBox="0 0 24 24">
                                    <defs><clipPath id="polaZv"><rect x="0" y="0" width="12" height="24" /></clipPath></defs>
                                    <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" fill="none" stroke="currentColor" strokeWidth="1.6" />
                                    <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" fill="currentColor" clipPath="url(#polaZv)" />
                                </svg>
                            </div>
                            <p className={styles.recSub}>na Google mapi</p>
                        </div>
                    </div>
                </div>
                <div className={styles.recGrid}>
                    {RECENZIJE.map((r, i) => (
                        <Rvl key={i} delay={i * 0.12} className={r.varijantaB ? styles.recB : styles.recKart}>
                            <div className={styles.zvez}>
                                <ZvezdaPuna /><ZvezdaPuna /><ZvezdaPuna /><ZvezdaPuna /><ZvezdaPuna />
                            </div>
                            <p className={styles.recTxt}>„{r.tekst}"</p>
                            <div className={styles.recIme}>
                                <span className={styles.recKo}>{r.ime}</span>
                            </div>
                        </Rvl>
                    ))}
                </div>
                <div className={styles.recFoot}>
                    <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className={styles.hbtn}>
                        Ostavi i ti recenziju ↗
                    </a>
                </div>
            </section>

            <hr className={styles.dash} />

            {/* ── Kontakt ── */}
            <section className={styles.sec} id="kontakt">
                <svg className={styles.doodle} style={{ top: 70, right: '9%', width: 50, color: 'var(--rust)', transform: 'rotate(10deg)' }} viewBox="0 0 60 54" fill="none"><path d="M30 48 C 8 32, 4 16, 14 9 C 22 4, 29 10, 30 16 C 31 10, 38 4, 46 9 C 56 16, 52 32, 30 48 Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" /></svg>
                <span className={styles.eyeb}>Kontakt</span>
                <h2 className={styles.h2}>Mirisom ćete <span className={`${styles.rust} ${styles.brushHi}`}>prepoznati.</span></h2>
                <div className={styles.kont}>
                    <div>
                        <div className={styles.kBlok}>
                            <span className={styles.kLbl}>Pozovi nas</span>
                            <a href="tel:+381658178476" className={styles.kTel}>+381 65 817 8476</a>
                        </div>
                        <div className={styles.kBlok}>
                            <span className={styles.kLbl}>Piši nam</span>
                            <a href="mailto:glumacplus@gmail.com" className={styles.kMejl}>glumacplus@gmail.com</a>
                        </div>
                        <div className={styles.kBlok}>
                            <span className={styles.kLbl}>Radno vreme</span>
                            <RadnoVreme />
                        </div>
                        <div className={styles.kBlok}>
                            <span className={styles.kLbl}>Prati nas</span>
                            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className={styles.kSoc}>Instagram ↗</a>
                            <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" className={styles.kSoc}>TikTok ↗</a>
                        </div>
                    </div>
                    <div>
                        <Rvl>
                            <div className={styles.mapa}>
                                <iframe
                                    title="Mapa Glumac Plus"
                                    src="https://maps.google.com/maps?q=44.8172559,20.4607985&output=embed&z=17"
                                    loading="lazy"
                                />
                            </div>
                        </Rvl>
                        <div className={styles.mapCap}>
                            <span>Dositejeva 1a · Dorćol · Beograd</span>
                            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">↗ otvori u mapi</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className={styles.foot}>
                <div className={styles.footTop}>
                    <img src={gpWhite} alt="Glumac Plus" className={styles.footLogo} />
                    <nav className={styles.footNav}>
                        <Link to="/meni" className={styles.footL}>Meni</Link>
                        <Link to="/loyalty" className={styles.footL}>Loyalty</Link>
                        {korisnik ? (
                            <Link to="/istorija" className={styles.footL}>Porudžbine</Link>
                        ) : (
                            <Link to="/login" className={styles.footL}>Prijava</Link>
                        )}
                    </nav>
                </div>
                <p className={styles.footPozz}>— vidimo se na palačinkama ♥ —</p>
                <div className={styles.footInfo}>
                    <span>
                        Dorćol, Beograd{danasVreme ? ` · Danas: ${danasVreme}` : ''} · +381 65 817 8476
                    </span>
                    <span>© {new Date().getFullYear()} Glumac Plus · Est. 2000</span>
                </div>
                <button
                    className={styles.footVrh}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    aria-label="Nazad na vrh"
                >
                    <svg viewBox="0 0 24 30" fill="none"><path d="M12 26 C 13 18, 11 10, 12 4" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /><path d="M5 11 C 8 8, 10 5, 12 3 C 14 5, 16 8, 19 11" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
            </footer>
        </div>
    );
}
