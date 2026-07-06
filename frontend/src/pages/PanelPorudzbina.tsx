import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    CheckCircle2, XCircle, RefreshCw, ChevronLeft, ChefHat, Bell, BellOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { tipLabela, type Porudzbina, type StatusPorudzbine } from '../types/porudzbina';
import styles from './PanelPorudzbina.module.css';

type Tab = 'PRIPREMA' | 'ZAVRSENE' | 'OTKAZANE';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

const PRESET_VREMENA = [10, 15, 20, 30];

const STATUS_LABELA: Record<Status, string> = {
    U_PRIPREMI:  'Nova',
    SPREMNA:     'U pripremi',
    REALIZOVANA: 'Završena',
    OTKAZANA:    'Otkazana',
};

const TABOVI: { kljuc: Tab; labela: string; status: StatusPorudzbine }[] = [
    { kljuc: 'PRIPREMA', labela: 'U pripremi', status: 'SPREMNA' },
    { kljuc: 'ZAVRSENE', labela: 'Završene',   status: 'REALIZOVANA' },
    { kljuc: 'OTKAZANE', labela: 'Otkazane',   status: 'OTKAZANA' },
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
    onZavrsi: (id: number) => void;
    onOtkazi: (id: number) => void;
}

function PorudzbinaKartica({ p, azurira, onPrihvati, onZavrsi, onOtkazi }: KarticaProps) {
    const [biranjeVremena, setBiranjeVremena] = useState(false);
    const [customMode, setCustomMode] = useState(false);
    const [customVreme, setCustomVreme] = useState('');

    const resetBiranje = () => {
        setBiranjeVremena(false);
        setCustomMode(false);
        setCustomVreme('');
    };

    const potvrdiCustom = () => {
        const v = Number(customVreme);
        if (!Number.isInteger(v) || v < 1 || v > 120) return;
        onPrihvati(p.porudzbinaId, v);
        resetBiranje();
    };

    return (
        <motion.div
            className={`${styles.kartica} ${styles[`akcent_${p.status}`]}`}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
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
                    {p.status === 'SPREMNA' && p.procenjenoVreme != null && ` · ~${p.procenjenoVreme} min`}
                </span>
            </div>

            {p.korisnikIme && <p className={styles.kupac}>{p.korisnikIme}</p>}

            <ul className={styles.stavke}>
                {p.stavke?.map((s, i) => (
                    <li key={i} className={styles.stavka}>
                        <span className={styles.stavkaKolicina}>{s.kolicina}×</span>
                        <span className={styles.stavkaNaziv}>{s.nazivProizvoda}</span>
                    </li>
                ))}
            </ul>

            {p.napomena && (
                <p className={styles.napomena}>
                    <span className={styles.napomenaLabel}>Napomena:</span> {p.napomena}
                </p>
            )}

            <div className={styles.karticaDno}>
                <span className={styles.ukupno}>{p.ukupanIznos.toLocaleString('sr-RS')} RSD</span>

                <div className={styles.akcije}>
                    {/* NOVA — prihvati (sa izborom vremena) ili otkaži */}
                    {p.status === 'U_PRIPREMI' && !biranjeVremena && (
                        <>
                            <button
                                className={`${styles.btn} ${styles.btnPrihvati}`}
                                onClick={() => setBiranjeVremena(true)}
                                disabled={azurira}
                            >
                                <ChefHat size={16} /> Prihvati
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnOtkazi}`}
                                onClick={() => onOtkazi(p.porudzbinaId)}
                                disabled={azurira}
                            >
                                <XCircle size={16} /> Otkaži
                            </button>
                        </>
                    )}

                    {/* Izbor vremena — brza dugmad */}
                    {p.status === 'U_PRIPREMI' && biranjeVremena && !customMode && (
                        <div className={styles.vremeBiraci}>
                            <button className={styles.vremeNazad} onClick={resetBiranje} title="Nazad">
                                <ChevronLeft size={16} />
                            </button>
                            <span className={styles.vremeLabel}>Vreme:</span>
                            {PRESET_VREMENA.map((v) => (
                                <button
                                    key={v}
                                    className={styles.vremeBtn}
                                    onClick={() => { onPrihvati(p.porudzbinaId, v); resetBiranje(); }}
                                    disabled={azurira}
                                >
                                    {v} min
                                </button>
                            ))}
                            <button className={styles.vremeBtn} onClick={() => setCustomMode(true)}>
                                Drugo
                            </button>
                        </div>
                    )}

                    {/* Custom vreme */}
                    {p.status === 'U_PRIPREMI' && biranjeVremena && customMode && (
                        <div className={styles.vremeBiraci}>
                            <button className={styles.vremeNazad} onClick={() => setCustomMode(false)} title="Nazad">
                                <ChevronLeft size={16} />
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

                    {/* U PRIPREMI — završi ili otkaži */}
                    {p.status === 'SPREMNA' && (
                        <>
                            <button
                                className={`${styles.btn} ${styles.btnZavrsi}`}
                                onClick={() => onZavrsi(p.porudzbinaId)}
                                disabled={azurira}
                            >
                                <CheckCircle2 size={16} /> Završi
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnOtkazi}`}
                                onClick={() => onOtkazi(p.porudzbinaId)}
                                disabled={azurira}
                            >
                                <XCircle size={16} /> Otkaži
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

    const prihvati = (id: number, vreme: number) =>
        izvrsi(id, { status: 'SPREMNA', procenjenoVreme: vreme }, async () => {
            if (!await patchStatus(id, 'SPREMNA')) return false;
            const vremeRes = await fetch(
                `${API}/api/porudzbine/${id}/procenjeno-vreme?procenjenoVreme=${vreme}`,
                { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
            );
            return vremeRes.ok;
        });

    const zavrsi = (id: number) => izvrsi(id, { status: 'REALIZOVANA' }, () => patchStatus(id, 'REALIZOVANA'));
    const otkazi = (id: number) => izvrsi(id, { status: 'OTKAZANA' }, () => patchStatus(id, 'OTKAZANA'));

    // Nove (neprihvaćene) idu u popup, ne u tab. Tab prikazuje izabrani status.
    const nove = useMemo(
        () => porudzbine.filter((p) => p.status === 'U_PRIPREMI').sort((a, b) => a.porudzbinaId - b.porudzbinaId),
        [porudzbine]
    );
    const prikazane = useMemo(() => {
        const status = TABOVI.find((t) => t.kljuc === tab)!.status;
        const lista = porudzbine.filter((p) => p.status === status);
        // U pripremi: FIFO (najstarije prvo); završene/otkazane: najnovije prvo
        return lista.sort((a, b) =>
            tab === 'PRIPREMA' ? a.porudzbinaId - b.porudzbinaId : b.porudzbinaId - a.porudzbinaId
        );
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
            {zvuk ? <Bell size={15} /> : <BellOff size={15} />}
            {zvuk ? 'Zvuk' : 'Zvuk isklj.'}
        </button>
    );

    return (
        <div className={styles.stranica}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerLevo}>
                    <span className={styles.oznaka}>Panel zaposlenog</span>
                    <h1 className={styles.naslov}>Porudžbine</h1>
                </div>
                <div className={styles.headerDesno}>
                    {ZvukToggle}
                    <span className={styles.zivo}>
                        <span className={styles.zivoTacka} /> uživo · 8s
                    </span>
                    <button className={styles.refreshBtn} onClick={() => fetchPorudzbine(true)} title="Osveži">
                        <RefreshCw size={16} />
                    </button>
                </div>
            </header>

            {/* Tabovi */}
            <div className={styles.tabovi}>
                {TABOVI.map((t) => {
                    const broj = porudzbine.filter((p) => p.status === t.status).length;
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

            {/* Lista izabranog taba */}
            {ucitava ? (
                <div className={styles.poruka}>Učitavam porudžbine...</div>
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
                                onZavrsi={zavrsi}
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
                                            onZavrsi={zavrsi}
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
