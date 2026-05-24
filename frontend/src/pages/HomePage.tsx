import { useRef, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'motion/react';
import { MapPin, Clock, Phone, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useRadnoVreme } from '../hooks/useRadnoVreme';
import CurvedLoop from '../components/CurvedLoop';
import Toast from '../components/Toast';
import styles from './HomePage.module.css';
import glovoLogo from '../assets/Glovo_Logo.svg.png';
import woltLogo from '../assets/Wolt-Logo.png';
import gpWhiteLogo from '../assets/GPwhiteNOBG.png';
import gpBlackLogo from '../assets/GPblackNOBG.png';
import heroLogo from '../assets/logo.png';

/* ─── Reveal — scroll-triggered fade (CSS klase, bez motion.div) ─── */

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });
    return (
        <div
            ref={ref}
            className={`${styles.reveal} ${inView ? styles.in : ''} ${className}`.trim()}
        >
            {children}
        </div>
    );
}

/* ─── Podaci ──────────────────────────────────────────────────────── */

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

interface Proizvod {
    id: number;
    naziv: string;
    opis?: string;
    cena: number;
    tip: string;
}

// Kurirani izbor preporuka — naziv se mečuje sa pravim proizvodom iz backenda,
// slika je dekorativna (backend proizvodi nemaju slike).
const PREPORUKE_FILTER = [
    { kljuc: 'dubai',    slika: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&auto=format&fit=crop' },
    { kljuc: 'glumac',   slika: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&auto=format&fit=crop' },
    { kljuc: 'šunka',    slika: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&auto=format&fit=crop' },
    { kljuc: 'giros',    slika: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&auto=format&fit=crop' },
    { kljuc: 'piletina', slika: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=400&auto=format&fit=crop' },
];

const MARQUEE_ITEMS = [
    'Nutella Plazma', 'Glumac palačinka', 'Specijalni kremovi',
    'Šljiva, domaće slatko', 'Šunka Kačkavalj', 'Palačinka piletina',
    'Pohovani meni', 'Giros',
];

const FOOD_SEPARATOR = '\u{1F374}\uFE0E';
const formatLoopItem = (item: string) => {
    const lower = item.toLocaleLowerCase('sr-RS');
    return lower.charAt(0).toLocaleUpperCase('sr-RS') + lower.slice(1);
};
const CURVED_LOOP_TEXT = `${MARQUEE_ITEMS.map(formatLoopItem).join(` ${FOOD_SEPARATOR} `)} ${FOOD_SEPARATOR}`;

const USP = [
    { br: '01', naslov: 'Poruči direktno', tekst: 'Online narudžbina kroz sajt — bodovi se automatski pripisuju.' },
    { br: '02', naslov: 'Preuzmi uživo', tekst: 'Dođi po porudžbinu u lokal — uvek sveža, gotova na vreme.' },
    { br: '03', naslov: 'Skupljaj bodove', tekst: 'Svaka porudžbina donosi loyalty bodove — do 20% popusta.' },
];

const NIVOI = [
    { naziv: 'Nova zvezda', prag: '0 bodova', popust: '0%' },
    { naziv: 'Epizodista', prag: '100 bodova', popust: '5%' },
    { naziv: 'Glavna uloga', prag: '500 bodova', popust: '10%' },
    { naziv: 'Oscar za palačinke', prag: '1000 bodova', popust: '20%' },
];

const STATS = [
    { v: '2000',   l: 'Godina otvaranja'  },
    { v: '40+',    l: 'Vrsta u ponudi'    },
    { v: 'Dorćol', l: 'Naša četvrt'       },
    { v: '7/7',    l: 'Dana otvoreni'     },
];

const GALERIJA = [
    { src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop', alt: 'Enterijer lokala', label: 'Ambijent', velika: true },
    { src: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=700&auto=format&fit=crop', alt: 'Palačinke', label: 'Slatke', velika: false },
    { src: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=700&auto=format&fit=crop', alt: 'Hrana', label: 'Sveže', velika: false },
    { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&auto=format&fit=crop', alt: 'Detalji', label: 'Detalji', velika: false },
];

/* ─── Stranica ────────────────────────────────────────────────────── */

export default function HomePage() {
    const { raspored, danas } = useRadnoVreme();
    const { dodaj } = useCart();

    const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
    const [toastPoruka, setToastPoruka] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${API}/api/proizvodi`)
            .then(r => r.ok ? r.json() : [])
            .then(setProizvodi)
            .catch(() => setProizvodi([]));
    }, []);

    const preporuke = useMemo(() =>
        PREPORUKE_FILTER
            .map(f => {
                const proizvod = proizvodi.find(p => p.naziv.toLowerCase().includes(f.kljuc));
                return proizvod ? { proizvod, slika: f.slika } : null;
            })
            .filter((x): x is { proizvod: Proizvod; slika: string } => x !== null),
        [proizvodi]
    );

    const handleDodaj = (p: Proizvod) => {
        dodaj(p);
        setToastPoruka(`${p.naziv} dodata u korpu`);
        setTimeout(() => setToastPoruka(null), 2500);
    };

    return (
        <div className={styles.stranica}>

            {/* ── 1. HERO ── */}
            <section className={styles.hero}>
                <video className={styles.heroVideo} autoPlay muted loop playsInline>
                    <source src="https://videos.pexels.com/video-files/6327757/6327757-uhd_2560_1440_25fps.mp4" type="video/mp4" />
                </video>

                <div className={styles.heroOverlay} />
                <div className={styles.heroLinija} />

                <motion.div
                    className={styles.heroSadrzaj}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                >

                    <img src={heroLogo} alt="Glumac Plus" className={styles.heroLogoImg} />

                    <p className={styles.heroLede}>Palačinke koje te stvarno zasite.</p>

                    <div className={styles.heroDugmadi}>
                        <Link to="/meni" className={styles.inkDugme}>Poruči odmah</Link>
                        <Link to="/loyalty" className={styles.ghostDugme}>Loyalty program →</Link>
                    </div>
                </motion.div>

                <div className={styles.heroSkrol}>↓</div>
            </section>

            {/* ── 2. NARUČIVANJE / DOSTAVA ── */}
            <section className={styles.dostavaSekcija}>

                {/* Levo — Glovo + Wolt */}
                <div className={styles.dostavaLevo}>
                    <Reveal>
                        <p className={styles.sekcijskiLabel}>— Naručite online</p>
                        <h2 className={styles.dostavaLevoNaslov}>
                            Dostava<br />
                            <em className={styles.rustItalic}>na vašu adresu.</em>
                        </h2>
                    </Reveal>

                    <div className={styles.dostavaKartice}>
                        <div className={`${styles.dostavaKartica} ${styles.dostavaGlovo}`}>
                            <img src={glovoLogo} alt="Glovo" className={styles.dostavaLogo} />
                            <a
                                href="https://glovoapp.com/en/rs/belgrade/stores/glumac-plus-beg"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${styles.dostavaBtn} ${styles.dostavaGlovoBtn}`}
                            >
                                Poruči →
                            </a>
                        </div>

                        <div className={`${styles.dostavaKartica} ${styles.dostavaWolt}`}>
                            <img src={woltLogo} alt="Wolt" className={styles.dostavaLogo} />
                            <a
                                href="https://wolt.com/en/srb/belgrade/restaurant/palainkarnica-glumac-plus"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${styles.dostavaBtn} ${styles.dostavaWoltBtn}`}
                            >
                                Poruči →
                            </a>
                        </div>
                    </div>
                </div>

                {/* Desno — USP + linkovi */}
                <div className={styles.dostavaDesno}>
                    <p className={styles.sekcijskiLabel}>— Ili poruči kod nas</p>

                    <ol className={styles.uspLista}>
                        {USP.map((usp) => (
                            <Reveal key={usp.br}>
                                <li className={styles.uspRed}>
                                    <em className={styles.uspBroj}>{usp.br}</em>
                                    <div>
                                        <h3 className={styles.uspNaslov}>{usp.naslov}</h3>
                                        <p className={styles.uspTekst}>{usp.tekst}</p>
                                    </div>
                                </li>
                            </Reveal>
                        ))}
                    </ol>

                    <div className={styles.dostavaLinkovi}>
                        <Link to="/meni" className={styles.dostavaMenuBtn}>Poruči sada →</Link>
                        <Link to="/loyalty" className={styles.strelicaDole}> Loyalty program →</Link>
                    </div>
                </div>
            </section>

            {/* ── 3. CURVED LOOP ── */}
            <div className={styles.curvedLoopRow} aria-hidden="true">
                <div className={styles.curvedLoopDesktop}>
                    <CurvedLoop
                        marqueeText={CURVED_LOOP_TEXT}
                        speed={1}
                        curveAmount={170}
                        direction="left"
                        interactive
                        className={styles.curvedLoopText}
                    />
                </div>

                <div className={styles.curvedLoopMobile}>
                    <CurvedLoop
                        marqueeText={CURVED_LOOP_TEXT}
                        speed={0.9}
                        curveAmount={86}
                        direction="left"
                        interactive
                        className={styles.curvedLoopText}
                    />
                </div>
            </div>
            <div className={styles.prelazPaper2} aria-hidden="true" />

            {/* ── 4. NAŠE PREPORUKE ── */}
            <section className={styles.meniSekcija}>
                <div className={styles.container}>
                    <Reveal className={styles.sekcijskaGlava}>
                        <span className={styles.eyebrow}>— Karta</span>
                        <h2 className={styles.sekcijaNaslov}>Naše preporuke.</h2>
                    </Reveal>

                    <Reveal>
                        <ul className={styles.meniLista}>
                            {preporuke.map(({ proizvod, slika }, idx) => (
                                <li className={styles.meniRed} key={proizvod.id}>
                                    <Link
                                        to="/meni"
                                        className={styles.meniRedLink}
                                        aria-label={`${proizvod.naziv} — otvori meni`}
                                    />
                                    <span className={styles.meniNum}>{String(idx + 1).padStart(2, '0')}</span>
                                    <h3 className={styles.meniNaziv}>{proizvod.naziv}</h3>
                                    <span className={styles.meniCena}>
                                        {Math.round(proizvod.cena)}<span className={styles.cenaRsd}>RSD</span>
                                    </span>
                                    <button
                                        className={styles.meniDodaj}
                                        onClick={() => handleDodaj(proizvod)}
                                        aria-label={`Dodaj ${proizvod.naziv} u korpu`}
                                    >
                                        <Plus size={16} strokeWidth={2} />
                                    </button>
                                    <div className={styles.meniThumb}>
                                        <img src={slika} alt="" loading="lazy" />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Reveal>

                    <div className={styles.meniPodnozje}>
                        <span>Cela karta u meniju — preko 40 vrsta.</span>
                        <Link to="/meni" className={styles.meniPodnozjeLink}>
                            Otvori meni →
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── 5. O NAMA ── */}
            <section className={styles.oNamaSekcija}>
                <img src={gpBlackLogo} className={styles.oNamaDecorLogo} aria-hidden="true" alt="" />
                <div className={styles.container}>
                    <Reveal className={styles.sekcijskaGlava}>
                        <span className={styles.eyebrow}>— Priča</span>
                        <h2 className={styles.sekcijaNaslov}>
                            Novi ambijent,{' '}
                            <em className={styles.rustItalic}>stari recepti.</em>
                        </h2>
                    </Reveal>

                    <div className={styles.oNamaGrid}>
                        <Reveal className={styles.oNamaTekst}>
                            <p>
                                Glumac Plus je mesto gde se palačinka shvata ozbiljno. Nema
                                kompromisa oko kvaliteta — svaka kombinacija se bira pažljivo,
                                svaki detalj se pravi sa ciljem.
                            </p>
                            <p>
                                Naš meni se menjao godinama, ali princip ostaje isti — dobra
                                hrana, brzo, bez gužve. Nalazimo se u srcu Dorćola, u crnom
                                lokalu koji se ne može promašiti.
                            </p>
                            <p>Glamur nije u dekoraciji. U zalogaju je.</p>
                        </Reveal>

                        <Reveal className={styles.oNamaSlika}>
                            <div className={styles.oNamaSlikaFrame}>
                                <img
                                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop"
                                    alt="Enterijer palačinkarnice"
                                />
                                <p className={styles.oNamaSlikaCaption}>Sala, jutarnji sat</p>
                            </div>
                        </Reveal>
                    </div>

                    <Reveal className={styles.statsGrid}>
                        {STATS.map((s) => (
                            <div className={styles.statBlok} key={s.l}>
                                <span className={styles.statVrednost}>{s.v}</span>
                                <span className={styles.statLabel}>{s.l}</span>
                            </div>
                        ))}
                    </Reveal>
                </div>
            </section>

            {/* ── 6. LOYALTY ── */}
            <section className={styles.loyaltySekcija} id="loyalty">
                <img src={gpWhiteLogo} className={styles.loyaltyDecorLogo} aria-hidden="true" alt="" />
                <div className={styles.loyaltyLevo}>
                    <Reveal>
                        <p className={styles.sekcijskiLabelSvetli}>— Loyalty program</p>
                        <h2 className={styles.loyaltyNaslov}>
                            Nagrađujemo<br />
                            <em className={styles.loyaltyAkcent}>vernost.</em>
                        </h2>
                        <p className={styles.loyaltyOpis}>
                            Svaka porudžbina donosi bodove. Više bodova — veći popust.
                            Naš najviši nivo nosi naziv koji zaslužuje.
                        </p>
                        <Link to="/loyalty" className={styles.paperDugme}>
                            Pogledaj svoj status →
                        </Link>
                    </Reveal>
                </div>

                <div className={styles.loyaltyDesno}>
                    {NIVOI.map((nivo) => (
                        <Reveal key={nivo.naziv}>
                            <div className={styles.loyaltyRed}>
                                <div>
                                    <p className={styles.loyaltyRedNaziv}>{nivo.naziv}</p>
                                    <p className={styles.loyaltyRedPrag}>{nivo.prag}</p>
                                </div>
                                <span className={styles.loyaltyRedPopust}>{nivo.popust}</span>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ── 7. GALERIJA ── */}
            <section className={styles.galerijaSekcija}>
                <Reveal className={styles.galerijaGlava}>
                    <p className={styles.sekcijskiLabel}>— Naš lokal</p>
                    <h2 className={styles.galerija_naslov}>
                        Dođi, vidi, <em className={styles.rustItalic}>ostani.</em>
                    </h2>
                </Reveal>

                <div className={styles.galerijaGrid}>
                    {GALERIJA.map((stavka, i) => (
                        <div
                            key={stavka.alt}
                            className={`${styles.galerijaStavka} ${stavka.velika ? styles.galerijaVelika : ''}`}
                        >
                            <img src={stavka.src} alt={stavka.alt} />
                            <span className={styles.galerijaLabel}>
                                <em>{String(i + 1).padStart(2, '0')}</em> {stavka.label}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 8. KONTAKT ── */}
            <section className={styles.kontaktSekcija} id="kontakt">
                <div className={styles.kontaktWrap}>

                    <Reveal>
                        <p className={styles.sekcijskiLabel}>— Kontakt</p>
                        <h2 className={styles.kontaktNaslov}>
                            Mirisom ćete <em className={styles.rustItalic}>prepoznati.</em>
                        </h2>
                    </Reveal>

                    <div className={styles.kontaktHrLine} />

                    <div className={styles.kontaktLayout}>

                        <Reveal>
                            <div className={styles.contactBlock}>
                                <span className={styles.kontaktKolLabel}>Kontakt</span>
                                <a href="tel:+381658178476" className={styles.contactTel}>
                                    +381 65 817 8476
                                </a>
                                <a href="mailto:glumacplus@gmail.com" className={styles.contactMail}>
                                    glumacplus@gmail.com
                                </a>
                            </div>

                            <div className={styles.contactBlock}>
                                <span className={styles.kontaktKolLabel}>Radno vreme</span>
                                <ul className={styles.radnoVremeList}>
                                    {raspored.map((d) => (
                                        <li key={d.dan}>
                                            <span>{d.skracenica}</span>
                                            <span>{d.vreme ?? 'Zatvoreno'}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </Reveal>

                        <Reveal className={styles.mapWrap}>
                            <div className={`${styles.mapFrame} ${styles.clipStamp}`}>
                                <iframe
                                    title="Mapa Glumac Plus"
                                    src="https://maps.google.com/maps?q=44.8172559,20.4607985&output=embed&z=17"
                                    loading="lazy"
                                />
                                <span className={styles.mapPin} aria-hidden="true" />
                            </div>
                            <div className={styles.mapCaption}>
                                <span className={styles.contactAdresa}>Dositejeva 1a · Dorćol · Beograd</span>
                                <a
                                    href="https://www.google.com/maps/place/Glumac+plus/data=!4m2!3m1!1s0x0:0xb7899385a5114972?sa=X&ved=1t:2428&ictx=111"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.mapLink}
                                >
                                    ↗ Otvori u mapi
                                </a>
                            </div>
                        </Reveal>

                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className={styles.footer}>
                <div className={styles.footerWordmark}>
                    <img src={gpWhiteLogo} alt="Glumac Plus" className={styles.footerLogo} />
                </div>

                <div className={styles.footerDivider} />

                <div className={styles.footerInfo}>
                    <div className={styles.footerKontakt}>
                        <span className={styles.footerKontaktRed}>
                            <MapPin size={13} strokeWidth={1.5} /> Dorćol, Beograd
                        </span>
                        <span className={styles.footerKontaktRed}>
                            <Clock size={13} strokeWidth={1.5} /> Danas: {danas?.vreme ?? 'Zatvoreno'}
                        </span>
                        <span className={styles.footerKontaktRed}>
                            <Phone size={13} strokeWidth={1.5} /> +381 65 817 8476
                        </span>
                    </div>

                    <nav className={styles.footerNav}>
                        <Link to="/meni">Meni</Link>
                        <Link to="/loyalty">Loyalty</Link>
                        <Link to="/istorija">Porudžbine</Link>
                        <Link to="/login">Prijava</Link>
                    </nav>
                </div>

                <div className={styles.footerCopy}>
                    <span>© 2026 Glumac Plus · Sva prava zadržana</span>
                    <span>Est. 2000 · Dorćol, Beograd</span>
                </div>
            </footer>

            <Toast poruka={toastPoruka} />

        </div>
    );
}
