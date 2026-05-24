import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import styles from './LoyaltyPage.module.css';

/* ─── Konstante ──────────────────────────────────────────── */

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

const NIVOI = [
    {
        naziv: 'Nova zvezda',
        prag: 0,
        popust: 0,
        opis: 'Ulaz u program. Bodovi se pripisuju automatski od prve porudžbine.',
    },
    {
        naziv: 'Epizodista',
        prag: 100,
        popust: 5,
        opis: 'Prvih 5% popusta. Tvoja vernost počinje da se isplaćuje.',
    },
    {
        naziv: 'Glavna uloga',
        prag: 500,
        popust: 10,
        opis: 'Dupli popust i status koji malo ko dostigne.',
    },
    {
        naziv: 'Oscar za palačinke',
        prag: 1000,
        popust: 20,
        opis: 'Vrhunski nivo. 20% popusta na svaku porudžbinu — trajno.',
    },
];

/* ─── Tip za stats fetch ─────────────────────────────────── */

interface PorudzbinaStats {
    datum: string;
    status: string;
    ukupanIznos: number;
    originalnaCena?: number;
}

/* ─── FadeIn — helper za scroll-triggered animacije ─────── */

interface FadeInProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}

function FadeIn({ children, delay = 0, className }: FadeInProps) {
    const ref = useRef<HTMLDivElement>(null);
    // once: true → animira se samo pri prvom ulasku u viewport
    const inView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' });

    return (
        <motion.div
            ref={ref}
            className={className}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            {children}
        </motion.div>
    );
}

/* ─── Red u tabeli nivoa ─────────────────────────────────── */

interface NivoRedProps {
    nivo: typeof NIVOI[0];
    index: number;
    aktivan: boolean;
    dostignut: boolean;
}

function NivoRed({ nivo, index, aktivan, dostignut }: NivoRedProps) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' });

    return (
        <motion.div
            ref={ref}
            className={`${styles.nivoRed} ${aktivan ? styles.nivoRedAktivan : ''} ${!dostignut && !aktivan ? styles.nivoRedNedostignut : ''}`}
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: dostignut || aktivan ? 1 : 0.5, x: 0 } : { opacity: 0, x: -16 }}
            transition={{ duration: 0.7, delay: 0.08 * index, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <span className={styles.nivoRedBroj}>§ 0{index + 1}</span>

            <div className={styles.nivoRedNazivWrap}>
                <span className={styles.nivoRedNaziv}>{nivo.naziv}</span>
                {aktivan && <span className={styles.trenutnoTag}>Trenutno</span>}
            </div>

            <p className={styles.nivoRedOpis}>{nivo.opis}</p>

            <span className={styles.nivoRedPrag}>
                {nivo.prag === 0 ? '0 bod.' : `${nivo.prag} bod.`}
            </span>

            <span className={styles.nivoRedPopust}>{nivo.popust}%</span>
        </motion.div>
    );
}

/* ─── Glavni page ────────────────────────────────────────── */

export default function LoyaltyPage() {
    const { korisnik, token } = useAuth();
    const navigate = useNavigate();

    /* Stats state */
    const [loadingStats, setLoadingStats] = useState(true);
    const [porudzbineOvajMesec, setPorudzbineOvajMesec] = useState(0);
    const [ukupnoUstedeno, setUkupnoUstedeno] = useState(0);

    /* Fetch statistike porudžbina */
    useEffect(() => {
        if (!korisnik || !token) {
            setLoadingStats(false);
            return;
        }
        fetch(`${API}/api/porudzbine/moje?page=0&size=100`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => (r.ok ? r.json() : Promise.reject()))
            .then(data => {
                const lista: PorudzbinaStats[] = Array.isArray(data)
                    ? data
                    : (data.content ?? []);

                const sad = new Date();
                const ovajMesec = lista.filter(p => {
                    const d = new Date(p.datum);
                    return (
                        d.getFullYear() === sad.getFullYear() &&
                        d.getMonth() === sad.getMonth() &&
                        p.status === 'REALIZOVANA'
                    );
                });

                const ustedeno = lista.reduce((sum, p) => {
                    if (p.originalnaCena != null && p.originalnaCena > p.ukupanIznos) {
                        return sum + (p.originalnaCena - p.ukupanIznos);
                    }
                    return sum;
                }, 0);

                setPorudzbineOvajMesec(ovajMesec.length);
                setUkupnoUstedeno(Math.round(ustedeno));
            })
            .catch(() => {})
            .finally(() => setLoadingStats(false));
    }, [token, korisnik]);

    /* Izračunavanje napretka */
    const bodovi = korisnik?.brojBodova ?? 0;
    const trenutniNivo = [...NIVOI].reverse().find(n => bodovi >= n.prag) ?? NIVOI[0];
    const sledeciNivo = NIVOI.find(n => n.prag > bodovi);

    let procenat = 100;
    let preostalo = 0;
    if (sledeciNivo) {
        const opseg = sledeciNivo.prag - trenutniNivo.prag;
        const osvoj = bodovi - trenutniNivo.prag;
        procenat = Math.round((osvoj / opseg) * 100);
        preostalo = sledeciNivo.prag - bodovi;
    }

    return (
        <div className={styles.stranica}>

            {/* ── HERO ── */}
            <section className={styles.hero}>
                <div className={`${styles.heroGrid} ${!korisnik ? styles.heroGridGost : ''}`}>

                    {/* Levo — tekst */}
                    <motion.div
                        className={styles.heroLevo}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <p className={styles.eyebrow}>— Member Edition — Loyalty Program</p>

                        <h1 className={styles.heroNaslov}>
                            {korisnik
                                ? <>Zdravo,<br /><em className={styles.rustItalic}>{korisnik.ime}.</em></>
                                : <><span>Vrati se češće.</span><br /><em className={styles.rustItalic}>Plati manje.</em></>
                            }
                        </h1>

                        <p className={styles.heroLede}>
                            {korisnik ? (
                                <>
                                    Imaš <strong>{bodovi}</strong> bodova. Svaka porudžbina
                                    te približava sledećem nivou popusta.
                                </>
                            ) : (
                                <>
                                    Svaka porudžbina donosi bodove. Bodovi donose popuste —
                                    do <strong>20%</strong> na svaku narednu porudžbinu.
                                </>
                            )}
                        </p>

                        {!korisnik && (
                            <div className={styles.heroCta}>
                                <button
                                    className={styles.inkDugme}
                                    onClick={() => navigate('/register')}
                                >
                                    Pridruži se besplatno
                                </button>
                                <Link to="/login" className={styles.ghostLink}>
                                    Već imam nalog →
                                </Link>
                            </div>
                        )}
                    </motion.div>

                    {/* Desno — kartica (samo za ulogovane) */}
                    {korisnik && (
                        <motion.div
                            className={styles.heroKartica}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            {/* Dekorativni broj bodova u pozadini */}
                            <span className={styles.dekorativan} aria-hidden="true">
                                {bodovi}
                            </span>

                            {/* Header kartice */}
                            <div className={styles.kartGlava}>
                                <span className={styles.eyebrow}>Trenutni nivo</span>
                                <em className={styles.kartPopust}>
                                    {trenutniNivo.popust > 0
                                        ? `${trenutniNivo.popust}% popusta`
                                        : 'bez popusta'
                                    }
                                </em>
                            </div>

                            <h2 className={styles.kartNivoNaziv}>{trenutniNivo.naziv}</h2>

                            {/* Progress bar */}
                            <div className={styles.progresBlok}>
                                <div className={styles.progresBrojevi}>
                                    <span>{bodovi} bod.</span>
                                    {sledeciNivo && <span>{sledeciNivo.prag} bod.</span>}
                                </div>
                                <div className={styles.progresTraka}>
                                    <motion.div
                                        className={styles.progresFill}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${procenat}%` }}
                                        transition={{ delay: 0.7, duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                                    />
                                </div>
                                {sledeciNivo ? (
                                    <p className={styles.progresCaption}>
                                        Još {preostalo} bodova do „{sledeciNivo.naziv}"
                                    </p>
                                ) : (
                                    <p className={styles.progresCaption}>
                                        Dostigao si maksimalni nivo.
                                    </p>
                                )}
                            </div>

                            <hr className={styles.kartDivider} />

                            {/* Stats */}
                            <div className={styles.statsGrid}>
                                <div className={styles.statBlok}>
                                    <span className={styles.statBroj}>
                                        {loadingStats ? '—' : porudzbineOvajMesec}
                                    </span>
                                    <span className={styles.statLabel}>narudžbina ovaj mesec</span>
                                </div>
                                <div className={styles.statBlok}>
                                    <span className={styles.statBroj}>
                                        {loadingStats ? '—' : `${ukupnoUstedeno} RSD`}
                                    </span>
                                    <span className={styles.statLabel}>ukupno ušteđeno</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* ── TABELA NIVOA ── */}
            <section className={styles.nivoiSekcija}>
                <div className={styles.nivoiWrap}>
                    <FadeIn>
                        <p className={styles.sekcijskiLabel}>— § 01 — Nivoi</p>
                        <h2 className={styles.nivoiNaslov}>
                            Četiri nivoa,{' '}
                            <em className={styles.rustItalic}>jednostavna mehanika.</em>
                        </h2>
                    </FadeIn>

                    {/* Zaglavlje tabele */}
                    <div className={styles.nivoRedGlava}>
                        <span />
                        <span>Nivo</span>
                        <span>Šta to znači</span>
                        <span>Prag</span>
                        <span className={styles.desno}>Popust</span>
                    </div>

                    {/* Redovi */}
                    {NIVOI.map((nivo, i) => (
                        <NivoRed
                            key={nivo.naziv}
                            nivo={nivo}
                            index={i}
                            aktivan={korisnik !== null && nivo.naziv === trenutniNivo.naziv}
                            dostignut={korisnik !== null && bodovi >= nivo.prag}
                        />
                    ))}
                </div>
            </section>

            {/* ── KAKO RADI ── */}
            <section className={styles.kakoRadiSekcija}>
                <div className={styles.kakoRadiWrap}>
                    <FadeIn className={styles.kakoRadiGlava}>
                        <p className={styles.sekcijskiLabel}>— § 02 — Mehanika</p>
                        <h2 className={styles.kakoRadiNaslov}>
                            Kako{' '}
                            <em className={styles.rustItalic}>funkcioniše.</em>
                        </h2>
                    </FadeIn>

                    <div className={styles.koraci}>
                        {[
                            {
                                br: '01',
                                naslov: 'Naruči',
                                tekst: 'Svaka realizovana porudžbina donosi bodove — 1 bod po 1 RSD.',
                            },
                            {
                                br: '02',
                                naslov: 'Skupljaj',
                                tekst: 'Prelaskom pragova od 100, 500 i 1000 bodova otključavaš novi nivo.',
                            },
                            {
                                br: '03',
                                naslov: 'Uštedi',
                                tekst: 'Popust se automatski primenjuje pri svakoj sledećoj porudžbini.',
                            },
                        ].map((korak, i) => (
                            <FadeIn key={korak.br} delay={0.1 * i}>
                                <div className={styles.korak}>
                                    <div className={styles.korakBorderTop} />
                                    <em className={styles.korakBroj}>{korak.br}</em>
                                    <h3 className={styles.korakNaslov}>{korak.naslov}</h3>
                                    <p className={styles.korakTekst}>{korak.tekst}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── END CTA (samo za gosta) ── */}
            {!korisnik && (
                <FadeIn>
                    <section className={styles.endCta}>
                        <h2 className={styles.endCtaNaslov}>
                            Počni danas.{' '}
                            <em className={styles.rustItalic}>Uštedi sutra.</em>
                        </h2>
                        <button
                            className={styles.inkDugme}
                            onClick={() => navigate('/register')}
                        >
                            Kreiraj besplatan nalog
                        </button>
                    </section>
                </FadeIn>
            )}

        </div>
    );
}
