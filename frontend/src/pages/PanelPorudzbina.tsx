import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { tipLabela, type Porudzbina, type StatusPorudzbine } from '../types/porudzbina';
import { Zvono, Refresh } from '../components/Doodle';
import styles from './PanelPorudzbina.module.css';

type Tab = 'PRIPREMA' | 'ZAVRSENE' | 'OTKAZANE';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

const PRESET_VREMENA = [10, 15, 20, 30];

const STATUS_LABELA: Record<StatusPorudzbine, string> = {
    NOVA:        'Nova',
    U_PRIPREMI:  'U pripremi',
    SPREMNA:     'Spremna',
    REALIZOVANA: 'Realizovana',
    OTKAZANA:    'Otkazana',
};

// PRIPREMA obuhvata dva statusa (U_PRIPREMI + SPREMNA) — dve kolone.
const TABOVI: { kljuc: Tab; labela: string; statusi: StatusPorudzbine[] }[] = [
    { kljuc: 'PRIPREMA', labela: 'U pripremi',  statusi: ['U_PRIPREMI', 'SPREMNA'] },
    { kljuc: 'ZAVRSENE', labela: 'Realizovane', statusi: ['REALIZOVANA'] },
    { kljuc: 'OTKAZANE', labela: 'Otkazane',    statusi: ['OTKAZANA'] },
];

function formatDatum(datum: string) {
    return new Date(datum).toLocaleString('sr-RS', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });
}

/* ─── Kartica porudžbine ──────────────────────────────────── */

interface KarticaProps {
    p: Porudzbina;
    azurira: boolean;
    onPrihvati: (id: number, vreme: number) => void;
    onSpremno: (id: number) => void;
    onPreuzeto: (id: number) => void;
    onOtkazi: (id: number) => void;
}

function PorudzbinaKartica({ p, azurira, onPrihvati, onSpremno, onPreuzeto, onOtkazi }: KarticaProps) {
    const [customMode, setCustomMode] = useState(false);
    const [customVreme, setCustomVreme] = useState('');
    const [stavkeProsirene, setStavkeProsirene] = useState(false);

    const PRIKAZI_STAVKI = 3;
    const sveStavke = p.stavke ?? [];
    const vidljiveStavke = stavkeProsirene ? sveStavke : sveStavke.slice(0, PRIKAZI_STAVKI);
    const skrivenoStavki = sveStavke.length - PRIKAZI_STAVKI;

    const potvrdiCustom = () => {
        const v = Number(customVreme);
        if (!Number.isInteger(v) || v < 1 || v > 120) return;
        onPrihvati(p.porudzbinaId, v);
        setCustomMode(false);
        setCustomVreme('');
    };

    return (
        <motion.div
            className={`${styles.kartica} ${styles[`akcent_${p.status}`]}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <div className={styles.karticaGlava}>
                <div className={styles.karticaLevo}>
                    <span className={styles.karticaId}>#{p.porudzbinaId}</span>
                    <span className={styles.karticaDatum}>{formatDatum(p.datum)}</span>
                    {p.tipPorudzbine && (
                        <span className={styles.tipBadge}>{tipLabela(p.tipPorudzbine)}</span>
                    )}
                </div>
                <span className={`${styles.statusBadge} ${styles[`badge_${p.status}`]}`}>
                    {STATUS_LABELA[p.status]}
                    {p.status === 'U_PRIPREMI' && p.procenjenoVreme != null && ` · ~${p.procenjenoVreme} min`}
                </span>
            </div>

            {p.korisnikIme && <p className={styles.kupac}>{p.korisnikIme}</p>}

            <ul className={styles.stavke}>
                {vidljiveStavke.map((s, i) => (
                    <li key={i} className={styles.stavka}>
                        <span className={styles.stavkaKolicina}>{s.kolicina}×</span>
                        <span className={styles.stavkaNaziv}>{s.nazivProizvoda}</span>
                    </li>
                ))}
                {skrivenoStavki > 0 && (
                    <li>
                        <button
                            className={styles.stavkeToggle}
                            onClick={() => setStavkeProsirene(v => !v)}
                        >
                            {stavkeProsirene ? 'prikaži manje' : `+ još ${skrivenoStavki}…`}
                        </button>
                    </li>
                )}
            </ul>

            {p.napomena && (
                <p className={styles.napomena}>
                    <span className={styles.napomenaLabel}>Napomena:</span> {p.napomena}
                </p>
            )}

            <div className={styles.karticaDno}>
                <span className={styles.ukupno}>{p.ukupanIznos.toLocaleString('sr-RS')} RSD</span>

                <div className={styles.akcije}>
                    {/* NOVA — izbor vremena JE prihvatanje (bez zasebnog koraka); ili odbij */}
                    {p.status === 'NOVA' && !customMode && (
                        <div className={styles.vremeBiraci}>
                            <span className={styles.vremeLabel}>prihvati za:</span>
                            {PRESET_VREMENA.map((v) => (
                                <button
                                    key={v}
                                    className={styles.vremeBtn}
                                    onClick={() => onPrihvati(p.porudzbinaId, v)}
                                    disabled={azurira}
                                >
                                    {v} min
                                </button>
                            ))}
                            <button className={styles.vremeBtn} onClick={() => setCustomMode(true)} disabled={azurira}>
                                drugo
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnOtkazi}`}
                                onClick={() => onOtkazi(p.porudzbinaId)}
                                disabled={azurira}
                            >
                                ✕ Odbij
                            </button>
                        </div>
                    )}

                    {/* Custom vreme */}
                    {p.status === 'NOVA' && customMode && (
                        <div className={styles.vremeBiraci}>
                            <button className={styles.vremeNazad} onClick={() => setCustomMode(false)} title="Nazad">
                                ‹
                            </button>
                            <input
                                type="number"
                                min={1}
                                max={120}
                                className={styles.vremeInput}
                                value={customVreme}
                                onChange={(e) => setCustomVreme(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && potvrdiCustom()}
                                placeholder="min"
                                autoFocus
                            />
                            <button
                                className={`${styles.btn} ${styles.btnPrihvati}`}
                                onClick={potvrdiCustom}
                                disabled={azurira || !customVreme}
                            >
                                Potvrdi
                            </button>
                        </div>
                    )}

                    {/* U PRIPREMI — spremno (čeka preuzimanje) ili otkaži */}
                    {p.status === 'U_PRIPREMI' && (
                        <>
                            <button
                                className={`${styles.btn} ${styles.btnPrihvati}`}
                                onClick={() => onSpremno(p.porudzbinaId)}
                                disabled={azurira}
                            >
                                ✓ Spremno
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnOtkazi}`}
                                onClick={() => onOtkazi(p.porudzbinaId)}
                                disabled={azurira}
                            >
                                ✕ Otkaži
                            </button>
                        </>
                    )}

                    {/* SPREMNA — kupac je došao i preuzeo, ili otkaži */}
                    {p.status === 'SPREMNA' && (
                        <>
                            <button
                                className={`${styles.btn} ${styles.btnZavrsi}`}
                                onClick={() => onPreuzeto(p.porudzbinaId)}
                                disabled={azurira}
                            >
                                ✓ Preuzeto
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnOtkazi}`}
                                onClick={() => onOtkazi(p.porudzbinaId)}
                                disabled={azurira}
                            >
                                ✕ Otkaži
                            </button>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

/* ─── Glavni panel ────────────────────────────────────────── */

export default function PanelPorudzbina() {
    const { korisnik, token } = useAuth();
    const navigate = useNavigate();

    const [porudzbine, setPorudzbine] = useState<Porudzbina[]>([]);
    const [ucitava, setUcitava] = useState(true);
    const [tab, setTab] = useState<Tab>('PRIPREMA');
    const [azurira, setAzurira] = useState<number | null>(null);
    const [zvuk, setZvuk] = useState(false);

    // Auto-refresh se pauzira ~4s oko akcije da ne pregazi tek promenjeno stanje.
    const poslednjaAkcija = useRef(0);
    const audioCtxRef = useRef<AudioContext | null>(null);

    // Provera uloge
    useEffect(() => {
        if (!korisnik) {
            navigate('/login');
            return;
        }
        if (korisnik.uloga !== 'ADMIN' && korisnik.uloga !== 'ZAPOSLENI') {
            navigate('/');
        }
    }, [korisnik, navigate]);

    const fetchPorudzbine = useCallback(async (force = false) => {
        if (!token) return;
        if (!force && Date.now() - poslednjaAkcija.current < 4000) return;
        const pokrenuto = Date.now();
        try {
            const res = await fetch(`${API}/api/porudzbine/page?page=0&size=100`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                // Gledalo najskoriju akciju, time resavamo konflikt autoresresh vs rucna promena
                if (!force && poslednjaAkcija.current >= pokrenuto) return;
                setPorudzbine(data.content ?? data);
            }
        } catch {
            // tiho — auto-refresh će pokušati ponovo
        } finally {
            setUcitava(false);
        }
    }, [token]);

    useEffect(() => {
        fetchPorudzbine(true);
        const interval = setInterval(() => fetchPorudzbine(), 8000);
        return () => clearInterval(interval);
    }, [fetchPorudzbine]);

    const patchStatus = async (id: number, noviStatus: StatusPorudzbine): Promise<boolean> => {
        if (!token) return false;
        const res = await fetch(`${API}/api/porudzbine/${id}/status?status=${noviStatus}`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.ok;
    };

    // Optimistički update: UI se menja ODMAH, mreža ide u pozadini.
    // Cooldown drži auto-refresh dalje ~4s da ne pregazi; ako padne — povučemo tačno stanje.
    const izvrsi = async (id: number, dopuna: Partial<Porudzbina>, mreza: () => Promise<boolean>) => {
        setPorudzbine((prev) => prev.map((p) => p.porudzbinaId === id ? { ...p, ...dopuna } : p));
        poslednjaAkcija.current = Date.now();
        setAzurira(id);
        try {
            const ok = await mreza();
            if (!ok) await fetchPorudzbine(true);
        } catch {
            await fetchPorudzbine(true);
        } finally {
            setAzurira(null);
            poslednjaAkcija.current = Date.now();
        }
    };

    // Prvo vreme (dok je NOVA — bez notifikacije), pa status — notifikacija
    // "prihvaćena, ~X min" ide tek na prelazu NOVA → U_PRIPREMI.
    const prihvati = (id: number, vreme: number) =>
        izvrsi(id, { status: 'U_PRIPREMI', procenjenoVreme: vreme }, async () => {
            const vremeRes = await fetch(
                `${API}/api/porudzbine/${id}/procenjeno-vreme?procenjenoVreme=${vreme}`,
                { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
            );
            if (!vremeRes.ok) return false;
            return patchStatus(id, 'U_PRIPREMI');
        });

    const spremno  = (id: number) => izvrsi(id, { status: 'SPREMNA' },     () => patchStatus(id, 'SPREMNA'));
    const preuzeto = (id: number) => izvrsi(id, { status: 'REALIZOVANA' }, () => patchStatus(id, 'REALIZOVANA'));
    const otkazi   = (id: number) => izvrsi(id, { status: 'OTKAZANA' },    () => patchStatus(id, 'OTKAZANA'));

    // Nove (neprihvaćene) idu u popup, ne u tab.
    const nove = useMemo(
        () => porudzbine.filter((p) => p.status === 'NOVA').sort((a, b) => a.porudzbinaId - b.porudzbinaId),
        [porudzbine]
    );
    // Tab "U pripremi" — dve kolone: levo u toku, desno spremne (čekaju preuzimanje). FIFO.
    const uToku = useMemo(
        () => porudzbine.filter((p) => p.status === 'U_PRIPREMI').sort((a, b) => a.porudzbinaId - b.porudzbinaId),
        [porudzbine]
    );
    const spremne = useMemo(
        () => porudzbine.filter((p) => p.status === 'SPREMNA').sort((a, b) => a.porudzbinaId - b.porudzbinaId),
        [porudzbine]
    );
    // Ostali tabovi: najnovije prvo.
    const prikazane = useMemo(() => {
        const statusi = TABOVI.find((t) => t.kljuc === tab)!.statusi;
        return porudzbine
            .filter((p) => statusi.includes(p.status))
            .sort((a, b) => b.porudzbinaId - a.porudzbinaId);
    }, [porudzbine, tab]);

    // Zvučni alarm: pišti dok ima neprihvaćenih porudžbina (i dok je zvuk uključen).
    const bip = useCallback(() => {
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
    }, []);

    useEffect(() => {
        if (!zvuk || nove.length === 0) return;
        bip();
        const id = setInterval(bip, 3000);
        return () => clearInterval(id);
    }, [zvuk, nove.length, bip]);

    const toggleZvuk = () => {
        // Prvi klik otključava audio (browser autoplay policy zahteva gest korisnika).
        if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
        audioCtxRef.current.resume();
        setZvuk((v) => !v);
    };

    const ZvukToggle = (
        <button
            className={`${styles.zvukBtn} ${zvuk ? styles.zvukAktivan : ''}`}
            onClick={toggleZvuk}
            title={zvuk ? 'Isključi zvuk' : 'Uključi zvuk'}
        >
            <Zvono size={17} strokeWidth={2.2} />
            {zvuk ? 'Zvuk' : 'Zvuk isklj.'}
        </button>
    );

    return (
        <div className={styles.stranica}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerLevo}>
                    <span className={styles.oznaka}>panel zaposlenog</span>
                    <h1 className={styles.naslov}>Porudžbine</h1>
                </div>
                <div className={styles.headerDesno}>
                    {ZvukToggle}
                    <span className={styles.zivo}>
                        <span className={styles.zivoTacka} /> uživo
                    </span>
                    <button className={styles.refreshBtn} onClick={() => fetchPorudzbine(true)} title="Osveži">
                        <Refresh size={18} strokeWidth={2.2} />
                    </button>
                </div>
            </header>

            {/* Tabovi */}
            <div className={styles.tabovi}>
                {TABOVI.map((t) => {
                    const broj = porudzbine.filter((p) => t.statusi.includes(p.status)).length;
                    return (
                        <button
                            key={t.kljuc}
                            className={`${styles.tab} ${tab === t.kljuc ? styles.tabAktivan : ''}`}
                            onClick={() => setTab(t.kljuc)}
                        >
                            {t.labela}
                            <span className={styles.tabBroj}>{broj}</span>
                        </button>
                    );
                })}
            </div>

            {/* Sadržaj izabranog taba */}
            {ucitava ? (
                <div className={styles.poruka}>Učitavam porudžbine...</div>
            ) : tab === 'PRIPREMA' ? (
                /* Dve jasno razdvojene kolone: levo u toku, desno spremne za preuzimanje */
                <div className={styles.kolone}>
                    <div className={styles.kolona}>
                        <div className={styles.kolonaGlava}>
                            <span className={styles.kolonaNaslov}>u toku</span>
                            <span className={styles.kolonaBroj}>{uToku.length}</span>
                        </div>
                        {uToku.length === 0 ? (
                            <div className={styles.kolonaPrazno}>ništa se trenutno ne sprema</div>
                        ) : (
                            <div className={styles.kolonaLista}>
                                <AnimatePresence initial={false}>
                                    {uToku.map((p) => (
                                        <PorudzbinaKartica
                                            key={p.porudzbinaId}
                                            p={p}
                                            azurira={azurira === p.porudzbinaId}
                                            onPrihvati={prihvati}
                                            onSpremno={spremno}
                                            onPreuzeto={preuzeto}
                                            onOtkazi={otkazi}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                    <div className={`${styles.kolona} ${styles.kolonaSpremne}`}>
                        <div className={styles.kolonaGlava}>
                            <span className={`${styles.kolonaNaslov} ${styles.kolonaNaslovZel}`}>
                                spremne — čekaju preuzimanje
                            </span>
                            <span className={`${styles.kolonaBroj} ${styles.kolonaBrojZel}`}>{spremne.length}</span>
                        </div>
                        {spremne.length === 0 ? (
                            <div className={styles.kolonaPrazno}>nijedna ne čeka preuzimanje</div>
                        ) : (
                            <div className={styles.kolonaLista}>
                                <AnimatePresence initial={false}>
                                    {spremne.map((p) => (
                                        <PorudzbinaKartica
                                            key={p.porudzbinaId}
                                            p={p}
                                            azurira={azurira === p.porudzbinaId}
                                            onPrihvati={prihvati}
                                            onSpremno={spremno}
                                            onPreuzeto={preuzeto}
                                            onOtkazi={otkazi}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            ) : prikazane.length === 0 ? (
                <div className={styles.poruka}>Nema porudžbina.</div>
            ) : (
                <div className={styles.lista}>
                    <AnimatePresence initial={false}>
                        {prikazane.map((p) => (
                            <PorudzbinaKartica
                                key={p.porudzbinaId}
                                p={p}
                                azurira={azurira === p.porudzbinaId}
                                onPrihvati={prihvati}
                                onSpremno={spremno}
                                onPreuzeto={preuzeto}
                                onOtkazi={otkazi}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* ── POPUP: nove porudžbine (ostaje dok se ne prihvate/otkažu) ── */}
            <AnimatePresence>
                {nove.length > 0 && (
                    <motion.div
                        className={styles.popupOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className={styles.popupModal}
                            initial={{ opacity: 0, scale: 0.96, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 20 }}
                            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                        >
                            <span className={styles.popupStiker}>
                                <Zvono size={16} strokeWidth={2.2} /> nova porudžbina!
                            </span>
                            <div className={styles.popupGlava}>
                                <span className={styles.popupNaslov}>
                                    <span className={styles.popupTacka} />
                                    {nove.length === 1 ? 'Nova porudžbina' : 'Nove porudžbine'}
                                    <span className={styles.popupBroj}>{nove.length}</span>
                                </span>
                                {ZvukToggle}
                            </div>
                            <div className={styles.popupLista}>
                                <AnimatePresence initial={false}>
                                    {nove.map((p) => (
                                        <PorudzbinaKartica
                                            key={p.porudzbinaId}
                                            p={p}
                                            azurira={azurira === p.porudzbinaId}
                                            onPrihvati={prihvati}
                                            onSpremno={spremno}
                                            onPreuzeto={preuzeto}
                                            onOtkazi={otkazi}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
