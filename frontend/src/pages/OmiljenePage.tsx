import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    Bookmark, Trash2, RotateCcw, X, AlertCircle,
    ChevronRight, CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAktivnaPorudzbina } from '../context/AktivnaPorudzbinaContext';
import { TIP_LABELE, type TipPorudzbine } from '../types/porudzbina';
import type { Proizvod } from '../types/proizvod';
import styles from './OmiljenePage.module.css';

/* ─── Tipovi ─────────────────────────────────────────────── */

interface OmiljenaStavka {
    proizvodId: number;
    nazivProizvoda: string;
    kolicina: number;
}

interface Omiljena {
    id: number;
    naziv: string;
    stavke: OmiljenaStavka[];
}

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

/* ─── Modal "Ponovi porudžbinu" ───────────────────────────── */

interface PonoviModalProps {
    omiljena: Omiljena;
    token: string;
    onZatvori: () => void;
    onUspeh: (porudzbinaId: number | null) => void;
}

function PonoviModal({ omiljena, token, onZatvori, onUspeh }: PonoviModalProps) {
    const [tip, setTip] = useState<TipPorudzbine>('U_LOKALU');
    const [napomena, setNapomena] = useState('');
    const [loading, setLoading] = useState(false);
    const [greska, setGreska] = useState('');

    const ponovi = async () => {
        setLoading(true);
        setGreska('');
        try {
            const params = new URLSearchParams({ tipPorudzbine: tip });
            if (napomena.trim()) params.set('napomena', napomena.trim());
            const res = await fetch(
                `${API}/api/omiljene-porudzbine/${omiljena.id}/ponovi?${params.toString()}`,
                { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.ok) {
                const data = await res.json().catch(() => null);
                onUspeh(data?.porudzbinaId ?? null);
            } else {
                const err = await res.json().catch(() => ({}));
                setGreska(err.message ?? 'Nije moguće poručiti. Možda je restoran zatvoren.');
            }
        } catch {
            setGreska('Greška u mreži.');
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
                        <RotateCcw size={18} strokeWidth={1.8} />
                    </div>
                    <div>
                        <h3 className={styles.modalNaslov}>Ponovi porudžbinu</h3>
                        <p className={styles.modalPodNaslov}>{omiljena.naziv}</p>
                    </div>
                    <button className={styles.modalZatvori} onClick={onZatvori} aria-label="Zatvori">
                        <X size={16} />
                    </button>
                </div>

                <div className={styles.modalTelo}>
                    <span className={styles.modalLabel}>Tip porudžbine</span>
                    <div className={styles.tipBiraci}>
                        {(Object.keys(TIP_LABELE) as TipPorudzbine[]).map((t) => (
                            <button
                                key={t}
                                className={`${styles.tipBirac} ${tip === t ? styles.tipAktivan : ''}`}
                                onClick={() => setTip(t)}
                            >
                                {TIP_LABELE[t]}
                            </button>
                        ))}
                    </div>

                    <span className={`${styles.modalLabel} ${styles.modalLabelRazmak}`}>Napomena (opciono)</span>
                    <textarea
                        className={styles.napomenaInput}
                        value={napomena}
                        onChange={(e) => setNapomena(e.target.value)}
                        placeholder="npr. bez oraha..."
                        maxLength={1000}
                        rows={2}
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
                    <button className={styles.modalDugmeGlavno} onClick={ponovi} disabled={loading}>
                        {loading ? 'Šaljem...' : 'Naruči'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ─── Kartica omiljene ────────────────────────────────────── */

interface KarticaProps {
    o: Omiljena;
    proizvodiMap: Map<number, Proizvod>;
    popust: number;
    onPonovi: (o: Omiljena) => void;
    onObrisi: (id: number) => void;
    brisanje: number | null;
}

function OmiljenaKartica({ o, proizvodiMap, popust, onPonovi, onObrisi, brisanje }: KarticaProps) {
    const stavkeSaCenom = o.stavke.map((s) => {
        const proizvod = proizvodiMap.get(s.proizvodId);
        return { ...s, cena: proizvod?.cena ?? null, dostupno: !!proizvod };
    });
    const ukupno = Math.round(
        stavkeSaCenom.reduce((sum, s) => sum + (s.cena ?? 0) * s.kolicina, 0)
    );
    // Zaokruživanje finalne cene (isto pravilo kao na meniju i u korpi).
    const zaPlacanje = popust > 0 ? Math.round(ukupno * (1 - popust / 100)) : ukupno;
    const imaNedostupnih = stavkeSaCenom.some((s) => !s.dostupno);

    return (
        <motion.div
            className={styles.kartica}
            layout
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.32 }}
        >
            <div className={styles.karticaGlava}>
                <h3 className={styles.karticaNaziv}>{o.naziv}</h3>
                <button
                    className={styles.obrisiBtn}
                    onClick={() => onObrisi(o.id)}
                    disabled={brisanje === o.id}
                    title="Obriši omiljenu"
                >
                    <Trash2 size={15} strokeWidth={1.8} />
                </button>
            </div>

            <ul className={styles.stavkeLista}>
                {stavkeSaCenom.map((s, i) => (
                    <li key={i} className={`${styles.stavkaRed} ${!s.dostupno ? styles.stavkaNedostupna : ''}`}>
                        <span className={styles.stavkaKolicina}>{s.kolicina}×</span>
                        <span className={styles.stavkaNaziv}>{s.nazivProizvoda}</span>
                        <span className={styles.stavkaCena}>
                            {s.dostupno
                                ? `${Math.round((s.cena ?? 0) * s.kolicina).toLocaleString('sr-RS')} RSD`
                                : 'nedostupno'}
                        </span>
                    </li>
                ))}
            </ul>

            <div className={styles.karticaDno}>
                <div className={styles.cenaBlok}>
                    {popust > 0 && (
                        <span className={styles.cenaOriginalna}>{ukupno.toLocaleString('sr-RS')} RSD</span>
                    )}
                    <span className={styles.cenaUkupna}>{zaPlacanje.toLocaleString('sr-RS')} RSD</span>
                </div>
                <button
                    className={styles.ponoviBtn}
                    onClick={() => onPonovi(o)}
                    disabled={brisanje === o.id}
                >
                    <RotateCcw size={14} strokeWidth={1.8} /> Ponovi
                </button>
            </div>

            {imaNedostupnih && (
                <div className={styles.napomenaNedostupno}>
                    <AlertCircle size={13} /> Neki proizvodi više nisu na meniju.
                </div>
            )}
        </motion.div>
    );
}

/* ─── Glavni page ─────────────────────────────────────────── */

export default function OmiljenePage() {
    const { korisnik, token, popust } = useAuth();
    const { otvoriStatus } = useAktivnaPorudzbina();

    const [omiljene, setOmiljene] = useState<Omiljena[]>([]);
    const [proizvodiMap, setProizvodiMap] = useState<Map<number, Proizvod>>(new Map());
    const [loading, setLoading] = useState(true);
    const [greska, setGreska] = useState('');
    const [brisanje, setBrisanje] = useState<number | null>(null);
    const [ponoviModal, setPonoviModal] = useState<Omiljena | null>(null);
    const [uspehPoruka, setUspehPoruka] = useState('');

    const ucitaj = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setGreska('');
        try {
            const [omiljeneRes, proizvodiRes] = await Promise.all([
                fetch(`${API}/api/omiljene-porudzbine/moje`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API}/api/proizvodi`),
            ]);
            if (!omiljeneRes.ok) throw new Error();
            const omiljeneData: Omiljena[] = await omiljeneRes.json();
            const proizvodiData: Proizvod[] = proizvodiRes.ok ? await proizvodiRes.json() : [];
            setOmiljene(omiljeneData);
            setProizvodiMap(new Map(proizvodiData.map((p) => [p.id, p])));
        } catch {
            setGreska('Nije moguće učitati omiljene. Pokušajte ponovo.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        ucitaj();
    }, [ucitaj]);

    const prikaziUspeh = (poruka: string) => {
        setUspehPoruka(poruka);
        setTimeout(() => setUspehPoruka(''), 3200);
    };

    const obrisi = async (id: number) => {
        if (!token) return;
        setBrisanje(id);
        try {
            const res = await fetch(`${API}/api/omiljene-porudzbine/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setOmiljene((prev) => prev.filter((o) => o.id !== id));
                prikaziUspeh('Omiljena je obrisana.');
            } else {
                prikaziUspeh('Nije moguće obrisati.');
            }
        } catch {
            prikaziUspeh('Greška u mreži.');
        } finally {
            setBrisanje(null);
        }
    };

    // PrivateRoute garantuje login — samo type guard
    if (!korisnik || !token) return null;

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
                        Sačuvano
                    </motion.span>
                    <motion.h1
                        className={styles.naslov}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.07 }}
                    >
                        Omiljene
                    </motion.h1>
                    {omiljene.length > 0 && (
                        <motion.p
                            className={styles.podNaslov}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.14 }}
                        >
                            {omiljene.length} {omiljene.length === 1 ? 'sačuvana kombinacija' : 'sačuvanih kombinacija'}
                        </motion.p>
                    )}
                </div>
            </header>

            {/* ── SADRŽAJ ── */}
            <main className={styles.sadrzaj}>
                {/* Toast */}
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

                {/* Skeleton */}
                {loading && (
                    <div className={styles.lista}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className={styles.skeleton} />
                        ))}
                    </div>
                )}

                {/* Prazno stanje */}
                {!loading && !greska && omiljene.length === 0 && (
                    <motion.div
                        className={styles.prazno}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className={styles.praznoIkonaWrap}>
                            <Bookmark size={32} strokeWidth={1.3} />
                        </div>
                        <h2 className={styles.praznoNaslov}>Još nemaš omiljenih</h2>
                        <p className={styles.praznoTekst}>
                            Sačuvaj porudžbinu iz istorije pa je poruči ponovo jednim klikom.
                        </p>
                        <Link to="/istorija" className={styles.praznoLink}>
                            Idi na porudžbine
                            <ChevronRight size={15} />
                        </Link>
                    </motion.div>
                )}

                {/* Lista */}
                {!loading && !greska && omiljene.length > 0 && (
                    <div className={styles.lista}>
                        <AnimatePresence mode="popLayout">
                            {omiljene.map((o) => (
                                <OmiljenaKartica
                                    key={o.id}
                                    o={o}
                                    proizvodiMap={proizvodiMap}
                                    popust={popust}
                                    onPonovi={(om) => setPonoviModal(om)}
                                    onObrisi={obrisi}
                                    brisanje={brisanje}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* ── MODAL "PONOVI" ── */}
            <AnimatePresence>
                {ponoviModal && (
                    <PonoviModal
                        omiljena={ponoviModal}
                        token={token}
                        onZatvori={() => setPonoviModal(null)}
                        onUspeh={(porudzbinaId) => {
                            setPonoviModal(null);
                            if (porudzbinaId) otvoriStatus(porudzbinaId);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
