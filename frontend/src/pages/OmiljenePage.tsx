import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useAktivnaPorudzbina } from '../context/AktivnaPorudzbinaContext';
import { TIP_LABELE, type TipPorudzbine } from '../types/porudzbina';
import type { Proizvod } from '../types/proizvod';
import { Kanta, Srce } from '../components/Doodle';
import styles from './OmiljenePage.module.css';

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

// Boje čioda po redosledu (rust · zelena · žuta), pa ciklično.
const PIN_BOJE = [
    { background: 'var(--rust)', boxShadow: 'inset -2px -3px 0 hsl(14 65% 30%), 0 3px 6px hsl(22 30% 14% / .3)' },
    { background: 'hsl(150 35% 40%)', boxShadow: 'inset -2px -3px 0 hsl(150 35% 26%), 0 3px 6px hsl(22 30% 14% / .3)' },
    { background: 'hsl(48 85% 55%)', boxShadow: 'inset -2px -3px 0 hsl(45 80% 40%), 0 3px 6px hsl(22 30% 14% / .3)' },
];

/* ─── Modal "ponovi porudžbinu" ──────────────────────────── */

function PonoviModal({ omiljena, token, popust, ukupno, onZatvori, onUspeh }: {
    omiljena: Omiljena;
    token: string;
    popust: number;
    ukupno: number;
    onZatvori: () => void;
    onUspeh: (porudzbinaId: number | null) => void;
}) {
    const [tip, setTip] = useState<TipPorudzbine>('U_LOKALU');
    const [napomena, setNapomena] = useState('');
    const [loading, setLoading] = useState(false);
    const [greska, setGreska] = useState('');

    const zaPlacanje = popust > 0 ? Math.round(ukupno * (1 - popust / 100)) : ukupno;

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
                setGreska(err.message ?? 'Nije moguće poručiti. Možda je lokal zatvoren.');
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onZatvori}
        >
            <motion.div
                className={styles.modal}
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                onClick={e => e.stopPropagation()}
            >
                <span className={styles.modalTape} />
                <button className={styles.modalZatvori} onClick={onZatvori} aria-label="Zatvori">✕</button>

                <span className={styles.modalEyeb}>ponovi porudžbinu</span>
                <h2 className={styles.modalNaslov}>„{omiljena.naziv}"</h2>
                <p className={styles.modalStavke}>
                    {omiljena.stavke.map(s => `${s.kolicina}× ${s.nazivProizvoda}`).join(', ')}
                </p>

                <div style={{ marginTop: 20 }}>
                    <span className={styles.tipLab}>tip porudžbine</span>
                    <div className={styles.tipBiraci}>
                        {(Object.keys(TIP_LABELE) as TipPorudzbine[]).map(t => (
                            <button
                                key={t}
                                className={tip === t ? styles.tipPilAktivan : styles.tipPil}
                                onClick={() => setTip(t)}
                            >
                                {TIP_LABELE[t]}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: 16 }}>
                    <span className={styles.tipLab}>napomena (opciono)</span>
                    <textarea
                        className={styles.napomena}
                        value={napomena}
                        onChange={e => setNapomena(e.target.value)}
                        placeholder="npr. bez oraha..."
                        maxLength={1000}
                        rows={2}
                    />
                </div>

                <div className={styles.modalCena}>
                    {popust > 0 && <span className={styles.modalPopust}>sa popustom −{popust}%</span>}
                    <span>
                        {popust > 0 && <span className={styles.cenaS}>{ukupno.toLocaleString('sr-RS')} </span>}
                        <span className={styles.cenaV} style={{ fontSize: 34 }}>
                            {zaPlacanje.toLocaleString('sr-RS')}<span className={styles.rsd}>RSD</span>
                        </span>
                    </span>
                </div>

                {greska && <span className={styles.modalGreska}>{greska}</span>}

                <div className={styles.modalDugmad}>
                    <button className={styles.modalOdustani} onClick={onZatvori} disabled={loading}>
                        Odustani
                    </button>
                    <button className={styles.modalNaruci} onClick={ponovi} disabled={loading}>
                        {loading ? 'Šaljem…' : 'Naruči →'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ─── Papirić omiljene ───────────────────────────────────── */

function Papiric({ o, proizvodiMap, popust, pinIndex, onPonovi, onObrisi, brisanje }: {
    o: Omiljena;
    proizvodiMap: Map<number, Proizvod>;
    popust: number;
    pinIndex: number;
    onPonovi: (o: Omiljena, ukupno: number) => void;
    onObrisi: (id: number) => void;
    brisanje: number | null;
}) {
    const stavkeSaCenom = o.stavke.map(s => {
        const proizvod = proizvodiMap.get(s.proizvodId);
        return { ...s, cena: proizvod?.cena ?? null, dostupno: !!proizvod };
    });
    const ukupno = Math.round(stavkeSaCenom.reduce((sum, s) => sum + (s.cena ?? 0) * s.kolicina, 0));
    const zaPlacanje = popust > 0 ? Math.round(ukupno * (1 - popust / 100)) : ukupno;
    const imaNedostupnih = stavkeSaCenom.some(s => !s.dostupno);
    const rot = (o.id % 3) - 1; // -1, 0, 1 → blaga rotacija

    return (
        <motion.div
            layout
            className={styles.papiric}
            style={{ transform: `rotate(${rot * 0.6}deg)` }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.32 }}
        >
            <span className={styles.pin} style={PIN_BOJE[pinIndex % PIN_BOJE.length]} />

            <div className={styles.papiricGlava}>
                <h3 className={styles.papiricNaziv}>„{o.naziv}"</h3>
                <button
                    className={styles.obrisi}
                    onClick={() => onObrisi(o.id)}
                    disabled={brisanje === o.id}
                    title="Obriši omiljenu"
                >
                    <Kanta size={20} strokeWidth={2} />
                </button>
            </div>

            <div className={styles.stavke}>
                {stavkeSaCenom.map((s, i) => (
                    <div key={i} className={s.dostupno ? styles.stavR : styles.stavRNedostupna}>
                        <span className={styles.stavK}>{s.kolicina}×</span>
                        <span className={s.dostupno ? undefined : styles.stavNazivPrecrtan}>
                            {s.nazivProizvoda}
                        </span>
                        <span className={styles.stavDots} />
                        {s.dostupno ? (
                            <span>{Math.round((s.cena ?? 0) * s.kolicina).toLocaleString('sr-RS')} RSD</span>
                        ) : (
                            <span className={styles.stavNedostupno}>nedostupno</span>
                        )}
                    </div>
                ))}
            </div>

            {imaNedostupnih && (
                <span className={styles.nedost}>! neki proizvodi više nisu na meniju</span>
            )}

            <div className={styles.papiricDno}>
                <span>
                    {popust > 0 && <span className={styles.cenaS}>{ukupno.toLocaleString('sr-RS')} </span>}
                    <span className={styles.cenaV}>
                        {zaPlacanje.toLocaleString('sr-RS')}<span className={styles.rsd}>RSD</span>
                    </span>
                </span>
                <button
                    className={styles.ponovi}
                    onClick={() => onPonovi(o, ukupno)}
                    disabled={brisanje === o.id}
                >
                    ↻ Ponovi
                </button>
            </div>
        </motion.div>
    );
}

/* ─── Glavni page ────────────────────────────────────────── */

export default function OmiljenePage() {
    const { korisnik, token, popust } = useAuth();
    const { postaviAktivnu } = useAktivnaPorudzbina();

    const [omiljene, setOmiljene] = useState<Omiljena[]>([]);
    const [proizvodiMap, setProizvodiMap] = useState<Map<number, Proizvod>>(new Map());
    const [loading, setLoading] = useState(true);
    const [greska, setGreska] = useState('');
    const [brisanje, setBrisanje] = useState<number | null>(null);
    const [ponoviModal, setPonoviModal] = useState<{ o: Omiljena; ukupno: number } | null>(null);
    const [toast, setToast] = useState('');

    const prikaziToast = (poruka: string) => {
        setToast(poruka);
        setTimeout(() => setToast(''), 3000);
    };

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
            setProizvodiMap(new Map(proizvodiData.map(p => [p.id, p])));
        } catch {
            setGreska('Nije moguće učitati omiljene. Pokušaj ponovo.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { ucitaj(); }, [ucitaj]);

    const obrisi = async (id: number) => {
        if (!token) return;
        setBrisanje(id);
        try {
            const res = await fetch(`${API}/api/omiljene-porudzbine/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setOmiljene(prev => prev.filter(o => o.id !== id));
                prikaziToast('Omiljena je obrisana.');
            } else prikaziToast('Nije moguće obrisati.');
        } catch {
            prikaziToast('Greška u mreži.');
        } finally {
            setBrisanje(null);
        }
    };

    if (!korisnik || !token) return null;

    return (
        <div className={styles.stranica}>
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className={styles.toast}
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                    >
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={styles.wrap}>
                <span className={styles.eyeb}>sačuvane kombinacije</span>
                <div className={styles.glava}>
                    <h1 className={styles.naslov}>Omiljene</h1>
                    {omiljene.length > 0 && (
                        <span className={styles.brojac}>
                            {omiljene.length} {omiljene.length === 1 ? 'sačuvana' : 'sačuvane'}
                        </span>
                    )}
                </div>

                {greska && <p className={styles.greska}>{greska}</p>}

                {loading && (
                    <div className={styles.tabla}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className={styles.skeleton} />
                        ))}
                    </div>
                )}

                {!loading && !greska && omiljene.length === 0 && (
                    <motion.div
                        className={styles.prazno}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Srce size={70} strokeWidth={2.6} className={styles.praznoIkona} />
                        <h2 className={styles.praznoNaslov}>Još nemaš omiljenih.</h2>
                        <p className={styles.praznoTekst}>
                            Sačuvaj porudžbinu iz istorije, pa je sledeći put poruči jednim klikom.
                        </p>
                        <Link to="/istorija" className={styles.praznoLink}>Idi na porudžbine →</Link>
                    </motion.div>
                )}

                {!loading && !greska && omiljene.length > 0 && (
                    <div className={styles.tabla}>
                        <AnimatePresence mode="popLayout">
                            {omiljene.map((o, i) => (
                                <Papiric
                                    key={o.id}
                                    o={o}
                                    proizvodiMap={proizvodiMap}
                                    popust={popust}
                                    pinIndex={i}
                                    onPonovi={(om, ukupno) => setPonoviModal({ o: om, ukupno })}
                                    onObrisi={obrisi}
                                    brisanje={brisanje}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {ponoviModal && (
                    <PonoviModal
                        omiljena={ponoviModal.o}
                        token={token}
                        popust={popust}
                        ukupno={ponoviModal.ukupno}
                        onZatvori={() => setPonoviModal(null)}
                        onUspeh={(porudzbinaId) => {
                            setPonoviModal(null);
                            if (porudzbinaId) postaviAktivnu(porudzbinaId);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
