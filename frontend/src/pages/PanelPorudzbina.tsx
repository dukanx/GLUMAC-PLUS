import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { tipLabela, type Porudzbina, type StatusPorudzbine } from '../types/porudzbina';
import { Zvono, Refresh, Sat } from '../components/Doodle';
import ZatvoriSmenuModal from '../components/ZatvoriSmenuModal';
import * as smenaApi from '../api/smena';
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

/* ─── Odbrojavanje vremena pripreme ───────────────────────────
   Početak pamtimo lokalno po porudžbini (panel je jedan tablet),
   pa MM:SS otkucava u realnom vremenu. */
const LS_PANEL_START = 'panel_vreme_start';

function ucitajStartMapu(): Record<number, number> {
    try { return JSON.parse(localStorage.getItem(LS_PANEL_START) || '{}'); }
    catch { return {}; }
}

function stampStart(id: number): number {
    const mapa = ucitajStartMapu();
    if (!mapa[id]) {
        mapa[id] = Date.now();
        localStorage.setItem(LS_PANEL_START, JSON.stringify(mapa));
    }
    return mapa[id];
}

function obrisiStart(id: number) {
    const mapa = ucitajStartMapu();
    if (mapa[id] != null) {
        delete mapa[id];
        localStorage.setItem(LS_PANEL_START, JSON.stringify(mapa));
    }
}

function Odbrojavanje({ id, minuta }: { id: number; minuta: number }) {
    const cilj = useMemo(() => stampStart(id) + minuta * 60000, [id, minuta]);
    const [preostalo, setPreostalo] = useState(() => Math.round((cilj - Date.now()) / 1000));

    useEffect(() => {
        const tick = () => setPreostalo(Math.round((cilj - Date.now()) / 1000));
        tick();
        const t = setInterval(tick, 1000);
        return () => clearInterval(t);
    }, [cilj]);

    const isteklo = preostalo <= 0;
    const prikazMin = Math.ceil(Math.abs(preostalo) / 60);
    return (
        <span className={`${styles.vremeChip} ${isteklo ? styles.vremeChipIsteklo : ''}`}>
            <Sat size={20} strokeWidth={2.4} />
            <span className={styles.vremeBroj}>{isteklo ? `+${prikazMin}` : prikazMin}</span>
            <span className={styles.vremeMin}>min</span>
        </span>
    );
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

    // Popust (za kasu — radnica mora da unese isti %). Izvedeno iz pune vs. konačne cene.
    const popustProcenat = p.originalnaCena != null && p.originalnaCena > p.ukupanIznos
        ? Math.round((1 - p.ukupanIznos / p.originalnaCena) * 100)
        : 0;

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
                {p.status === 'U_PRIPREMI' && p.procenjenoVreme != null ? (
                    <Odbrojavanje id={p.porudzbinaId} minuta={p.procenjenoVreme} />
                ) : (
                    <span className={`${styles.statusBadge} ${styles[`badge_${p.status}`]}`}>
                        {STATUS_LABELA[p.status]}
                    </span>
                )}
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
                <div className={styles.cenaBlok}>
                    <span className={styles.ukupno}>
                        {p.ukupanIznos.toLocaleString('sr-RS')}<span className={styles.rsd}>RSD</span>
                    </span>
                    {popustProcenat > 0 && (
                        <span className={styles.popustBlok}>
                            <span className={styles.popustBadge}>popust −{popustProcenat}%</span>
                            <span className={styles.punaCena}>
                                puna {p.originalnaCena!.toLocaleString('sr-RS')}
                            </span>
                        </span>
                    )}
                </div>

                <div className={`${styles.akcije} ${p.status === 'NOVA' ? styles.akcijeNova : ''}`}>
                    {/* NOVA — izbor vremena JE prihvatanje (bez zasebnog koraka); ili odbij */}
                    {p.status === 'NOVA' && !customMode && (
                        <div className={`${styles.vremeBiraci} ${styles.vremeBiraciNova}`}>
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
                                className={`${styles.btn} ${styles.btnOtkazi} ${styles.odbijUgao}`}
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
    // Zvuk je podrazumevano UKLJUČEN; audio se otključava na prvi dodir/klik (browser policy).
    // Ikonica je providna dok se ne otključa, pa crna — da ne zbuni pre prve interakcije.
    const [zvuk, setZvuk] = useState(true);
    const [zvukOtkljucan, setZvukOtkljucan] = useState(false);
    const [osvezava, setOsvezava] = useState(false);
    const [stanjeSmene, setStanjeSmene] = useState<smenaApi.SmenaStanje | null>(null);
    const [smenaModal, setSmenaModal] = useState(false);

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
    const prihvati = (id: number, vreme: number) => {
        stampStart(id); // start odbrojavanja = trenutak prihvatanja
        return izvrsi(id, { status: 'U_PRIPREMI', procenjenoVreme: vreme }, async () => {
            const vremeRes = await fetch(
                `${API}/api/porudzbine/${id}/procenjeno-vreme?procenjenoVreme=${vreme}`,
                { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
            );
            if (!vremeRes.ok) return false;
            return patchStatus(id, 'U_PRIPREMI');
        });
    };

    const spremno  = (id: number) => { obrisiStart(id); return izvrsi(id, { status: 'SPREMNA' },     () => patchStatus(id, 'SPREMNA')); };
    const preuzeto = (id: number) => { obrisiStart(id); return izvrsi(id, { status: 'REALIZOVANA' }, () => patchStatus(id, 'REALIZOVANA')); };
    const otkazi   = (id: number) => { obrisiStart(id); return izvrsi(id, { status: 'OTKAZANA' },    () => patchStatus(id, 'OTKAZANA')); };

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

    // Zvučni alarm: topli dvotonski "ding-dong" dok ima neprihvaćenih porudžbina.
    const bip = useCallback(() => {
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        // Jedan "zvonak" ton — dva sinusa (osnovni + kvinta) uz meki envelope.
        const ton = (freq: number, kada: number, trajanje: number, jacina: number) => {
            const t = ctx.currentTime + kada;
            [freq, freq * 1.5].forEach((f, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = f;
                osc.connect(gain);
                gain.connect(ctx.destination);
                const v = jacina * (i === 0 ? 1 : 0.4);
                gain.gain.setValueAtTime(0.0001, t);
                gain.gain.exponentialRampToValueAtTime(v, t + 0.012);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + trajanje);
                osc.start(t);
                osc.stop(t + trajanje);
            });
        };
        ton(1046.5, 0, 0.45, 0.3);      // C6 — "ding"
        ton(784.0, 0.16, 0.55, 0.26);   // G5 — "dong" (silazna kvinta)
    }, []);

    useEffect(() => {
        if (!zvuk || nove.length === 0) return;
        bip();
        const id = setInterval(bip, 3000);
        return () => clearInterval(id);
    }, [zvuk, nove.length, bip]);

    // Browser blokira zvuk dok korisnik ne interaguje sa stranicom. Zvuk je uključen
    // po defaultu, pa audio otključavamo na prvi dodir/klik/taster bilo gde na panelu.
    useEffect(() => {
        const otkljucaj = () => {
            const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            if (!audioCtxRef.current && Ctx) audioCtxRef.current = new Ctx();
            audioCtxRef.current?.resume();
            setZvukOtkljucan(true);
            window.removeEventListener('pointerdown', otkljucaj);
            window.removeEventListener('keydown', otkljucaj);
        };
        window.addEventListener('pointerdown', otkljucaj);
        window.addEventListener('keydown', otkljucaj);
        return () => {
            window.removeEventListener('pointerdown', otkljucaj);
            window.removeEventListener('keydown', otkljucaj);
        };
    }, []);

    const toggleZvuk = () => {
        // Prvi klik otključava audio (browser autoplay policy zahteva gest korisnika).
        // webkit prefiks za Safari; potvrdni bip da se ODMAH čuje da zvuk radi.
        const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!audioCtxRef.current && Ctx) audioCtxRef.current = new Ctx();
        audioCtxRef.current?.resume();
        setZvukOtkljucan(true);
        const novi = !zvuk;
        if (novi) bip();
        setZvuk(novi);
    };

    // Ručni refresh sa vidljivim odzivom (ikonica se vrti bar ~0.6s).
    const rucnoOsvezi = async () => {
        if (osvezava) return;
        setOsvezava(true);
        const t0 = Date.now();
        await fetchPorudzbine(true);
        setTimeout(() => setOsvezava(false), Math.max(0, 600 - (Date.now() - t0)));
    };

    // Stanje smene (prima porudžbine / pauzirano / van radnog vremena) — povremeno osvežavanje.
    useEffect(() => {
        if (!korisnik) return;
        const ucitaj = () => smenaApi.stanjeSmene().then(setStanjeSmene).catch(() => { });
        ucitaj();
        const id = setInterval(ucitaj, 15000);
        return () => clearInterval(id);
    }, [korisnik]);

    const togglePauza = async () => {
        const bilo = stanjeSmene?.pauzirano ?? false;
        setStanjeSmene(s => s ? { ...s, pauzirano: !bilo, primaPorudzbine: !bilo ? false : s.uRadnomVremenu } : s);
        try {
            setStanjeSmene(bilo ? await smenaApi.nastaviSmenu() : await smenaApi.pauzirajSmenu());
        } catch {
            smenaApi.stanjeSmene().then(setStanjeSmene).catch(() => { });
        }
    };

    const ZvukToggle = (
        <button
            className={`${styles.zvukBtn} ${zvuk && zvukOtkljucan ? styles.zvukAktivan : ''}`}
            onClick={toggleZvuk}
            title={zvuk ? 'Isključi zvuk' : 'Uključi zvuk'}
            aria-label={zvuk ? 'Isključi zvuk' : 'Uključi zvuk'}
        >
            <Zvono size={19} strokeWidth={2.2} />
        </button>
    );

    return (
        <div className={styles.stranica}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerLevo}>
                    <h1 className={styles.naslov}>Porudžbine</h1>
                </div>
                <div className={styles.headerDesno}>
                    {stanjeSmene && (
                        <span className={`${styles.smenaStatus} ${
                            stanjeSmene.primaPorudzbine ? styles.smenaStatusPrima : styles.smenaStatusZatvoreno
                        }`}>
                            <span className={styles.smenaTacka} />
                            {stanjeSmene.primaPorudzbine ? 'OTVORENO' : 'ZATVORENO'}
                        </span>
                    )}
                    <button className={styles.zatvoriBtn} onClick={() => setSmenaModal(true)}>
                        Zatvori smenu
                    </button>
                    <button
                        className={`${styles.pauzaBtn} ${stanjeSmene?.pauzirano ? styles.pauzaBtnNastavi : ''}`}
                        onClick={togglePauza}
                    >
                        {stanjeSmene?.pauzirano ? '▶ Nastavi' : '⏸ Pauziraj'}
                    </button>
                    {ZvukToggle}
                    <button
                        className={`${styles.refreshBtn} ${osvezava ? styles.refreshBtnSpin : ''}`}
                        onClick={rucnoOsvezi}
                        title="Osveži"
                    >
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
                                spremne
                            </span>
                            <span className={`${styles.kolonaBroj} ${styles.kolonaBrojZel}`}>{spremne.length}</span>
                        </div>
                        {spremne.length === 0 ? (
                            <div className={styles.kolonaPrazno}>nema spremnih</div>
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

            {/* ── Modal: zatvori smenu (kraj radnog dana) ── */}
            <AnimatePresence>
                {smenaModal && (
                    <ZatvoriSmenuModal
                        onClose={() => setSmenaModal(false)}
                        onZatvoreno={() => smenaApi.stanjeSmene().then(setStanjeSmene).catch(() => { })}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
