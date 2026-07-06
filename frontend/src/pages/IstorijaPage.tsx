import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    Clock, CheckCircle, XCircle, Package,
    ChevronDown, ChevronLeft, ChevronRight,
    Bookmark, X, AlertCircle, Eye, Check,
    ReceiptText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAktivnaPorudzbina } from '../context/AktivnaPorudzbinaContext';
import { tipLabela, type Porudzbina } from '../types/porudzbina';
import styles from './IstorijaPage.module.css';

/* ─── Pomocne funkcije ────────────────────────────────────── */

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

const STATUS_INFO: Record<
    Porudzbina['status'],
    { label: string; ikona: typeof Clock; klasa: string }
> = {
    U_PRIPREMI: { label: 'U pripremi', ikona: Clock, klasa: 'statusUPripremi' },
    SPREMNA: { label: 'Spremna', ikona: Package, klasa: 'statusSpremna' },
    REALIZOVANA: { label: 'Realizovana', ikona: CheckCircle, klasa: 'statusRealizovana' },
    OTKAZANA: { label: 'Otkazana', ikona: XCircle, klasa: 'statusOtkazana' },
};

function formatirajDatum(iso: string) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' })
        + ' · '
        + d.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' });
}

/* ─── Modal za čuvanje omiljene ──────────────────────────── */

interface OmiljenaModalProps {
    porudzbinaId: number;
    token: string;
    onZatvori: () => void;
    onUspeh: () => void;
}

function OmiljenaModal({ porudzbinaId, token, onZatvori, onUspeh }: OmiljenaModalProps) {
    const [naziv, setNaziv] = useState('');
    const [loading, setLoading] = useState(false);
    const [greska, setGreska] = useState('');

    const sacuvaj = async () => {
        if (!naziv.trim()) { setGreska('Unesite naziv'); return; }
        setLoading(true);
        setGreska('');
        try {
            const res = await fetch(
                `${API}/api/omiljene-porudzbine/iz-porudzbine/${porudzbinaId}?naziv=${encodeURIComponent(naziv.trim())}`,
                { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.ok) {
                onUspeh();
            } else {
                const err = await res.json().catch(() => ({}));
                setGreska(err.message ?? 'Greška pri čuvanju');
            }
        } catch {
            setGreska('Greška u mreži');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onZatvori}
        >
            <motion.div
                className={styles.modal}
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.modalGlava}>
                    <div className={styles.modalIkonaWrap}>
                        <Bookmark size={18} strokeWidth={1.8} />
                    </div>
                    <div>
                        <h3 className={styles.modalNaslov}>Sačuvaj kao omiljenu</h3>
                        <p className={styles.modalPodNaslov}>Daj naziv ovoj kombinaciji</p>
                    </div>
                    <button className={styles.modalZatvori} onClick={onZatvori} aria-label="Zatvori">
                        <X size={16} />
                    </button>
                </div>

                <div className={styles.modalTelo}>
                    <label className={styles.modalLabel}>Naziv omiljene</label>
                    <input
                        className={`${styles.modalInput} ${greska ? styles.modalInputGreska : ''}`}
                        type="text"
                        placeholder="npr. Moja jutarnja"
                        value={naziv}
                        onChange={(e) => { setNaziv(e.target.value); setGreska(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && sacuvaj()}
                        autoFocus
                        maxLength={60}
                    />
                    {greska && (
                        <span className={styles.modalGreska}>
                            <AlertCircle size={13} /> {greska}
                        </span>
                    )}
                </div>

                <div className={styles.modalDugmad}>
                    <button className={styles.modalDugmeSekundarno} onClick={onZatvori} disabled={loading}>
                        Odustani
                    </button>
                    <button className={styles.modalDugmeGlavno} onClick={sacuvaj} disabled={loading || !naziv.trim()}>
                        {loading ? 'Čuvam...' : 'Sačuvaj'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ─── Kartica porudžbine ──────────────────────────────────── */

interface KarticaProps {
    p: Porudzbina;
    onOtkazi: (id: number) => void;
    onSacuvajOmiljenu: (id: number) => void;
    otkazivanje: number | null;
    sacuvana: boolean;
}

function PorudzbinaKartica({ p, onOtkazi, onSacuvajOmiljenu, otkazivanje, sacuvana }: KarticaProps) {
    const [razvijeno, setRazvijeno] = useState(false);
    const info = STATUS_INFO[p.status] ?? STATUS_INFO.U_PRIPREMI;
    const StatusIkona = info.ikona;
    const imaPopust = p.originalnaCena != null && p.originalnaCena > p.ukupanIznos;

    return (
        <motion.div
            className={styles.kartica}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38 }}
        >
            {/* Gornji deo — uvek vidljiv */}
            <div className={styles.karticaGlava}>
                <div className={styles.karticaGlavaLevo}>
                    <span className={styles.karticaId}>#{p.porudzbinaId}</span>
                    <span className={styles.karticaDatum}>{formatirajDatum(p.datum)}</span>
                    {p.tipPorudzbine && (
                        <span className={styles.tipBadge}>
                            {tipLabela(p.tipPorudzbine)}
                        </span>
                    )}
                </div>

                <div className={styles.karticaGlavaDesno}>
                    {/* Status badge */}
                    <span className={`${styles.statusBadge} ${styles[info.klasa]}`}>
                        <StatusIkona size={13} strokeWidth={2} />
                        {info.label}
                    </span>

                    {/* Cena */}
                    <div className={styles.cenaBlok}>
                        {imaPopust && (
                            <span className={styles.cenaOriginalna}>
                                {p.originalnaCena?.toLocaleString('sr-RS')} RSD
                            </span>
                        )}
                        <span className={styles.cenaUkupna}>
                            {p.ukupanIznos.toLocaleString('sr-RS')} RSD
                        </span>
                    </div>
                </div>
            </div>

            {/* Napomena ako postoji */}
            {p.napomena && (
                <div className={styles.napomena}>
                    <span className={styles.napomenaLabel}>Napomena:</span> {p.napomena}
                </div>
            )}

            {/* Expandable stavke */}
            <button
                className={styles.razvijDugme}
                onClick={() => setRazvijeno((v) => !v)}
                aria-expanded={razvijeno}
            >
                <span>{razvijeno ? 'Sakrij stavke' : `Prikaži stavke (${p.stavke.length})`}</span>
                <motion.span
                    animate={{ rotate: razvijeno ? 180 : 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ display: 'flex' }}
                >
                    <ChevronDown size={15} />
                </motion.span>
            </button>

            <AnimatePresence>
                {razvijeno && (
                    <motion.div
                        className={styles.stavkeBlok}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                        style={{ overflow: 'hidden' }}
                    >
                        <ul className={styles.stavkeLista}>
                            {p.stavke.map((s, i) => (
                                <li key={i} className={styles.stavkaRed}>
                                    <span className={styles.stavkaKolicina}>{s.kolicina}×</span>
                                    <span className={styles.stavkaNaziv}>{s.nazivProizvoda}</span>
                                    <span className={styles.stavkaCena}>
                                        {s.iznosStavke.toLocaleString('sr-RS')} RSD
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Akcije */}
            <div className={styles.karticaAkcije}>
                <button
                    className={`${styles.akcijaOmiljenaDugme} ${sacuvana ? styles.akcijaOmiljenaSacuvano : ''}`}
                    onClick={() => onSacuvajOmiljenu(p.porudzbinaId)}
                    disabled={sacuvana}
                    title={sacuvana ? 'Već sačuvano kao omiljena' : 'Sačuvaj kao omiljenu'}
                >
                    {sacuvana ? <Check size={14} strokeWidth={2} /> : <Bookmark size={14} strokeWidth={1.8} />}
                    {sacuvana ? 'Sačuvano' : 'Sačuvaj kao omiljenu'}
                </button>

                {p.status === 'U_PRIPREMI' && (
                    <button
                        className={styles.akcijaOtkaziDugme}
                        onClick={() => onOtkazi(p.porudzbinaId)}
                        disabled={otkazivanje === p.porudzbinaId}
                    >
                        <XCircle size={14} strokeWidth={1.8} />
                        {otkazivanje === p.porudzbinaId ? 'Otkazujem...' : 'Otkaži'}
                    </button>
                )}
            </div>
        </motion.div>
    );
}

/* ─── Aktivna porudžbina (istaknuta na vrhu) ──────────────── */

const AKTIVNI_KORACI = [
    { status: 'U_PRIPREMI', labela: 'Primljeno' },
    { status: 'SPREMNA', labela: 'U pripremi' },
    { status: 'REALIZOVANA', labela: 'Gotovo' },
];

function AktivnaKartica({ p, onPrati }: { p: Porudzbina; onPrati: () => void }) {
    const aktivniIndex = p.status === 'SPREMNA' ? 1 : 0;

    return (
        <motion.div
            className={styles.aktivnaKartica}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className={styles.aktivnaGlava}>
                <span className={styles.aktivnaLabel}>
                    <span className={styles.aktivnaTacka} /> Aktivna porudžbina
                </span>
                <span className={styles.aktivnaId}>#{p.porudzbinaId}</span>
            </div>

            <div className={styles.aktivnaProgress}>
                <div className={styles.korakLinija} />
                {AKTIVNI_KORACI.map((k, i) => (
                    <div key={k.status} className={styles.aktivniKorak}>
                        <div className={`${styles.korakTacka} ${i <= aktivniIndex ? styles.korakTackaAktivna : ''}`} />
                        <span className={`${styles.korakLabela} ${i <= aktivniIndex ? styles.korakLabelaAktivna : ''}`}>
                            {k.labela}
                        </span>
                    </div>
                ))}
            </div>

            <button className={styles.pratiDugme} onClick={onPrati}>
                <Eye size={14} strokeWidth={1.8} /> Prati uživo
            </button>
        </motion.div>
    );
}

/* ─── Glavni page ─────────────────────────────────────────── */

const PAGE_SIZE = 8;

export default function IstorijaPage() {
    const { korisnik, token } = useAuth();
    const { otvoriStatus } = useAktivnaPorudzbina();
    const [porudzbine, setPorudzbine] = useState<Porudzbina[]>([]);
    const [ukupnoStrana, setUkupnoStrana] = useState(1);
    const [ukupnoStavki, setUkupnoStavki] = useState(0);
    const [stranica, setStranica] = useState(0);
    const [loading, setLoading] = useState(true);
    const [greska, setGreska] = useState('');
    const [otkazivanje, setOtkazivanje] = useState<number | null>(null);
    const [omiljenaModal, setOmiljenaModal] = useState<number | null>(null);
    const [sacuvane, setSacuvane] = useState<number[]>([]);
    const [uspehPoruka, setUspehPoruka] = useState('');

    const ucitaj = useCallback(async (page: number) => {
        if (!token) return;
        setLoading(true);
        setGreska('');
        try {
            const res = await fetch(
                `${API}/api/porudzbine/moje?page=${page}&size=${PAGE_SIZE}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) throw new Error('Greška pri učitavanju');
            const data = await res.json();
            if (Array.isArray(data)) {
                // Backend vraća plain listu (bez paginacije)
                setPorudzbine(data);
                setUkupnoStrana(1);
                setUkupnoStavki(data.length);
            } else {
                // Paginiran odgovor
                setPorudzbine(data.content ?? []);
                setUkupnoStrana(data.totalPages ?? 1);
                setUkupnoStavki(data.totalElements ?? 0);
            }
        } catch {
            setGreska('Nije moguće učitati istoriju. Pokušajte ponovo.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        ucitaj(stranica);
    }, [stranica, ucitaj]);

    const otkazi = async (id: number) => {
        if (!token) return;
        setOtkazivanje(id);
        try {
            const res = await fetch(`${API}/api/porudzbine/${id}/otkazi`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                // Ažuriramo lokalni state — samo promenimo status, ne refetch-ujemo
                setPorudzbine((prev) =>
                    prev.map((p) => p.porudzbinaId === id ? { ...p, status: 'OTKAZANA' } : p)
                );
                prikaziUspeh('Porudžbina je otkazana.');
            } else {
                const err = await res.json().catch(() => ({}));
                prikaziUspeh(err.message ?? 'Nije moguće otkazati.');
            }
        } catch {
            prikaziUspeh('Greška u mreži.');
        } finally {
            setOtkazivanje(null);
        }
    };

    const prikaziUspeh = (poruka: string) => {
        setUspehPoruka(poruka);
        setTimeout(() => setUspehPoruka(''), 3200);
    };

    // PrivateRoute garantuje login — samo type guard
    if (!korisnik || !token) return null;

    // Aktivna porudžbina (U_PRIPREMI/SPREMNA) ide u istaknutu karticu na vrhu,
    // pa je izbacujemo iz donje liste da se ne duplira
    const aktivna = porudzbine.find(
        p => p.status === 'U_PRIPREMI' || p.status === 'SPREMNA'
    ) ?? null;
    const istorija = aktivna
        ? porudzbine.filter(p => p.porudzbinaId !== aktivna.porudzbinaId)
        : porudzbine;

    return (
        <div className={styles.stranica}>
            {/* ── HEADER ── */}
            <header className={styles.header}>
                <div className={styles.headerSadrzaj}>
                    <motion.span
                        className={styles.oznaka}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Istorija
                    </motion.span>
                    <motion.h1
                        className={styles.naslov}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.07 }}
                    >
                        Porudžbine
                    </motion.h1>
                    {ukupnoStavki > 0 && (
                        <motion.p
                            className={styles.podNaslov}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.14 }}
                        >
                            Ukupno {ukupnoStavki} {ukupnoStavki === 1 ? 'porudžbina' : 'porudžbina'}
                        </motion.p>
                    )}
                </div>
            </header>

            {/* ── SADRŽAJ ── */}
            <main className={styles.sadrzaj}>

                {/* Toast obaveštenje */}
                <AnimatePresence>
                    {uspehPoruka && (
                        <motion.div
                            className={styles.toast}
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                        >
                            <CheckCircle size={15} />
                            {uspehPoruka}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Greška */}
                {greska && (
                    <div className={styles.greskaBlok}>
                        <AlertCircle size={16} />
                        {greska}
                    </div>
                )}

                {/* Aktivna porudžbina — istaknuta na vrhu */}
                {!loading && !greska && aktivna && (
                    <AktivnaKartica
                        p={aktivna}
                        onPrati={() => otvoriStatus(aktivna.porudzbinaId)}
                    />
                )}

                {/* Skeleton loading */}
                {loading && (
                    <div className={styles.lista}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className={styles.skeleton} />
                        ))}
                    </div>
                )}

                {/* Prazno stanje */}
                {!loading && !greska && porudzbine.length === 0 && (
                    <motion.div
                        className={styles.prazno}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className={styles.praznoIkonaWrap}>
                            <ReceiptText size={32} strokeWidth={1.3} />
                        </div>
                        <h2 className={styles.praznoNaslov}>Još uvek nisi naručio ništa</h2>
                        <p className={styles.praznoTekst}>
                            Tvoja istorija porudžbina će se pojaviti ovde čim napraviš prvu.
                        </p>
                        <Link to="/meni" className={styles.praznoLink}>
                            Idi na meni
                            <ChevronRight size={15} />
                        </Link>
                    </motion.div>
                )}

                {/* Lista */}
                {!loading && !greska && istorija.length > 0 && (
                    <>
                        <div className={styles.lista}>
                            <AnimatePresence mode="wait">
                                {istorija.map((p, i) => (
                                    <motion.div
                                        key={p.porudzbinaId}
                                        initial={{ opacity: 0, y: 18 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                    >
                                        <PorudzbinaKartica
                                            p={p}
                                            onOtkazi={otkazi}
                                            onSacuvajOmiljenu={(id) => setOmiljenaModal(id)}
                                            otkazivanje={otkazivanje}
                                            sacuvana={sacuvane.includes(p.porudzbinaId)}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Paginacija */}
                        {ukupnoStrana > 1 && (
                            <div className={styles.paginacija}>
                                <button
                                    className={styles.pagDugme}
                                    onClick={() => setStranica((s) => s - 1)}
                                    disabled={stranica === 0}
                                    aria-label="Prethodna strana"
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                <div className={styles.pagBrojevi}>
                                    {Array.from({ length: ukupnoStrana }).map((_, i) => (
                                        <button
                                            key={i}
                                            className={`${styles.pagBroj} ${i === stranica ? styles.pagBrojAktivan : ''}`}
                                            onClick={() => setStranica(i)}
                                            aria-current={i === stranica ? 'page' : undefined}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    className={styles.pagDugme}
                                    onClick={() => setStranica((s) => s + 1)}
                                    disabled={stranica === ukupnoStrana - 1}
                                    aria-label="Sledeća strana"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* ── MODAL ZA OMILJENU ── */}
            <AnimatePresence>
                {omiljenaModal !== null && (
                    <OmiljenaModal
                        porudzbinaId={omiljenaModal}
                        token={token}
                        onZatvori={() => setOmiljenaModal(null)}
                        onUspeh={() => {
                            if (omiljenaModal !== null) {
                                setSacuvane((prev) => [...prev, omiljenaModal]);
                            }
                            setOmiljenaModal(null);
                            prikaziUspeh('Sačuvano kao omiljena porudžbina!');
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}