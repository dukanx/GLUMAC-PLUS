import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useAktivnaPorudzbina } from '../context/AktivnaPorudzbinaContext';
import { tipLabela, type Porudzbina } from '../types/porudzbina';
import type { DodatakKorpe, Proizvod } from '../types/proizvod';
import { Klose, Sat, ChevronDole, Refresh, Srce } from '../components/Doodle';
import * as porudzbineApi from '../api/porudzbine';
import * as proizvodiApi from '../api/proizvodi';
import * as omiljeneApi from '../api/omiljene';
import { ApiError } from '../api/client';
import styles from './IstorijaPage.module.css';

const PAGE_SIZE = 8;
// Koraci narudžbenice: backend status → indeks aktivnog koraka.
const KORACI = ['PRIMLJENO', 'U PRIPREMI', 'SPREMNA'];

function korakIndex(status: string): number {
    if (status === 'NOVA') return 0;
    if (status === 'U_PRIPREMI') return 1;
    if (status === 'SPREMNA') return 2;
    if (status === 'REALIZOVANA') return 2;
    return 0;
}

function formatirajDatum(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('sr-RS', { day: 'numeric', month: '2-digit' })
        + '. · '
        + d.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' });
}

function sazetakStavki(p: Porudzbina): string {
    return p.stavke.map(s => `${s.kolicina}× ${s.nazivProizvoda}`).join(', ');
}

/* ─── Modal "sačuvaj kao omiljenu" ───────────────────────── */

function OmiljenaModal({ porudzbinaId, onZatvori, onUspeh }: {
    porudzbinaId: number; onZatvori: () => void; onUspeh: () => void;
}) {
    const [naziv, setNaziv] = useState('');
    const [loading, setLoading] = useState(false);
    const [greska, setGreska] = useState('');

    const sacuvaj = async () => {
        if (!naziv.trim()) { setGreska('Unesi naziv'); return; }
        setLoading(true);
        setGreska('');
        try {
            await omiljeneApi.sacuvajIzPorudzbine(porudzbinaId, naziv.trim());
            onUspeh();
        } catch (e) {
            setGreska(e instanceof ApiError ? e.message : 'Greška u mreži');
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
                <h3 className={styles.modalNaslov}>Sačuvaj kao omiljenu</h3>
                <p className={styles.modalPod}>daj naziv ovoj kombinaciji</p>
                <input
                    className={`${styles.modalInput} ${greska ? styles.modalInputGreska : ''}`}
                    type="text"
                    placeholder="npr. Moja jutarnja"
                    value={naziv}
                    onChange={e => { setNaziv(e.target.value); setGreska(''); }}
                    onKeyDown={e => e.key === 'Enter' && sacuvaj()}
                    autoFocus
                    maxLength={60}
                />
                {greska && <span className={styles.modalGreska}>{greska}</span>}
                <div className={styles.modalDugmad}>
                    <button className={styles.modalOtkazi} onClick={onZatvori} disabled={loading}>
                        odustani
                    </button>
                    <button className={styles.modalSacuvaj} onClick={sacuvaj} disabled={loading || !naziv.trim()}>
                        {loading ? 'Čuvam…' : 'Sačuvaj'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ─── Modal "korpa nije prazna" ──────────────────────────── */

/** Srpska množina za „stavka" (1 stavku, 2–4 stavke, ostalo stavki). */
function stavkeRec(n: number): string {
    const zadnja = n % 10;
    const zadnjeDve = n % 100;
    if (zadnja === 1 && zadnjeDve !== 11) return 'stavku';
    if (zadnja >= 2 && zadnja <= 4 && (zadnjeDve < 12 || zadnjeDve > 14)) return 'stavke';
    return 'stavki';
}

/**
 * Pita pre nego što dirne već sastavljenu korpu. Brisanje korpe se ne može
 * poništiti, pa se ne radi bez potvrde.
 */
function ZameniKorpuModal({ brojStavki, onZameni, onDodaj, onZatvori }: {
    brojStavki: number;
    onZameni: () => void;
    onDodaj: () => void;
    onZatvori: () => void;
}) {
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
                <h3 className={styles.modalNaslov}>Korpa nije prazna</h3>
                <p className={styles.modalPod}>
                    U korpi već imaš {brojStavki} {stavkeRec(brojStavki)}. Šta da radim
                    sa ovom porudžbinom?
                </p>
                <div className={styles.modalDugmad}>
                    <button className={styles.modalOtkazi} onClick={onDodaj}>
                        dodaj na postojeće
                    </button>
                    <button className={styles.modalSacuvaj} onClick={onZameni}>
                        Zameni korpu
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ─── Istorijska priznanica ──────────────────────────────── */

function Priznanica({ p, popust, onPoruciPonovo, onSacuvaj, sacuvana }: {
    p: Porudzbina;
    popust: number;
    onPoruciPonovo: (p: Porudzbina) => void;
    onSacuvaj: (id: number) => void;
    sacuvana: boolean;
}) {
    const [otvoreno, setOtvoreno] = useState(false);
    const otkazana = p.status === 'OTKAZANA';
    const realizovana = p.status === 'REALIZOVANA';
    const imaPopust = p.originalnaCena != null && p.originalnaCena > p.ukupanIznos;
    const popustIznos = imaPopust ? Math.round(p.originalnaCena! - p.ukupanIznos) : 0;

    return (
        <motion.div
            className={otkazana ? styles.istKartOtkazana : styles.istKart}
            style={{ transform: `rotate(${(p.porudzbinaId % 2 ? 0.25 : -0.2)}deg)` }}
            onClick={() => !otkazana && setOtvoreno(v => !v)}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className={styles.istGlava}>
                <div className={styles.istGlavaLevo}>
                    <span className={styles.pId} style={otkazana ? { color: 'var(--ink55)' } : undefined}>
                        #{p.porudzbinaId}
                    </span>
                    <span className={styles.pDat}>{formatirajDatum(p.datum)}</span>
                    {p.tipPorudzbine && <span className={styles.tipB}>{tipLabela(p.tipPorudzbine)}</span>}
                </div>
                <div className={styles.istGlavaDesno}>
                    <span className={otkazana ? styles.stOtk : styles.stReal}>
                        {otkazana ? 'otkazana' : '✓ preuzeta'}
                    </span>
                    <span>
                        {imaPopust && <span className={styles.cenaS}>{p.originalnaCena!.toLocaleString('sr-RS')} </span>}
                        <span className={`${styles.cenaV} ${otkazana ? styles.cenaOtkazana : ''}`}>
                            {p.ukupanIznos.toLocaleString('sr-RS')}<span className={styles.rsd}>RSD</span>
                        </span>
                    </span>
                </div>
            </div>

            {/* Sažetak stavki + strelica (uvek vidljivo) */}
            <div className={styles.sazetiRed}>
                <span className={styles.sazetiStavke}>
                    {sazetakStavki(p)}{otkazana ? ' · bez bodova' : ''}
                </span>
                {!otkazana && (
                    <ChevronDole size={17} className={otvoreno ? styles.chevOpen : styles.chev} />
                )}
            </div>

            {/* Detalji — glatko otvaranje (samo visina jedne sekcije) */}
            <AnimatePresence initial={false}>
                {otvoreno && !otkazana && (
                    <motion.div
                        className={styles.stavke}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        {p.stavke.map((s, i) => (
                            <div key={i} className={styles.stavR}>
                                <div className={styles.stavRGlava}>
                                    <span className={styles.stavK}>{s.kolicina}×</span>
                                    <span>{s.nazivProizvoda}</span>
                                    <span className={styles.stavDots} />
                                    <span>{s.iznosStavke.toLocaleString('sr-RS')} RSD</span>
                                </div>
                                {/* Cena dodatka je po komadu proizvoda — iznos stavke ih već sabira. */}
                                {s.dodaci && s.dodaci.length > 0 && (
                                    <div className={styles.dodaci}>
                                        {s.dodaci.map((d, j) => (
                                            <span key={j} className={styles.dodatak}>
                                                <span>+ {d.nazivProizvoda}{d.kolicina > 1 && ` ×${d.kolicina}`}</span>
                                                <span className={styles.dodatakCena}>
                                                    {Math.round(d.cena * d.kolicina).toLocaleString('sr-RS')}
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {p.napomena && (
                            <p className={styles.napomenaRed}>napomena: {p.napomena}</p>
                        )}

                        {(imaPopust || realizovana) && (
                            <div className={styles.popustRed}>
                                <span>{imaPopust ? `popust −${popust}%: −${popustIznos.toLocaleString('sr-RS')} RSD` : ''}</span>
                                {realizovana && (
                                    <span>+{Math.floor(p.ukupanIznos / 100).toLocaleString('sr-RS')} bodova</span>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Crni dugmići — ikonice sklopljeno, + tekst kad je otvoreno */}
            <div className={styles.akcije}>
                <button
                    className={`${styles.akcBtn} ${!otvoreno && !otkazana ? styles.akcBtnMini : ''}`}
                    onClick={e => { e.stopPropagation(); onPoruciPonovo(p); }}
                    aria-label="Poruči ponovo"
                    title="Poruči ponovo"
                >
                    <Refresh size={19} strokeWidth={2.4} />
                    {(otvoreno || otkazana) && <span>Poruči ponovo</span>}
                </button>
                {!otkazana && (
                    <button
                        className={`${styles.akcBtn} ${!otvoreno ? styles.akcBtnMini : ''} ${sacuvana ? styles.akcBtnSacuvana : ''}`}
                        onClick={e => { e.stopPropagation(); onSacuvaj(p.porudzbinaId); }}
                        disabled={sacuvana}
                        aria-label="Sačuvaj kao omiljenu"
                        title="Sačuvaj kao omiljenu"
                    >
                        <Srce size={19} strokeWidth={2.4} />
                        {otvoreno && <span>{sacuvana ? 'Sačuvano ✓' : 'Sačuvaj kao omiljenu'}</span>}
                    </button>
                )}
            </div>
        </motion.div>
    );
}

/* ─── Glavni page ────────────────────────────────────────── */

export default function IstorijaPage() {
    const { korisnik, token } = useAuth();
    const { korpa, dodaj, isprazni, otvoriDrawer, postaviPorukuKorpe } = useCart();
    const { aktivnaId, preostaloMin, otvoriPracenje } = useAktivnaPorudzbina();

    const [porudzbine, setPorudzbine] = useState<Porudzbina[]>([]);
    const [proizvodiPoNazivu, setProizvodiPoNazivu] = useState<Map<string, Proizvod>>(new Map());
    const [ukupnoStrana, setUkupnoStrana] = useState(1);
    const [ukupnoStavki, setUkupnoStavki] = useState(0);
    const [stranica, setStranica] = useState(0);
    const [loading, setLoading] = useState(true);
    const [greska, setGreska] = useState('');
    const [omiljenaModal, setOmiljenaModal] = useState<number | null>(null);
    const [zameniModal, setZameniModal] = useState<Porudzbina | null>(null);
    const [sacuvane, setSacuvane] = useState<number[]>([]);
    const [toast, setToast] = useState('');

    const prikaziToast = (poruka: string) => {
        setToast(poruka);
        setTimeout(() => setToast(''), 3000);
    };

    const ucitaj = useCallback(async (page: number) => {
        if (!token) return;
        setLoading(true);
        setGreska('');
        try {
            const data = await porudzbineApi.getMoje(page, PAGE_SIZE);
            if (Array.isArray(data)) {
                setPorudzbine(data);
                setUkupnoStrana(1);
                setUkupnoStavki(data.length);
            } else {
                setPorudzbine(data.content ?? []);
                setUkupnoStrana(data.totalPages ?? 1);
                setUkupnoStavki(data.totalElements ?? 0);
            }
        } catch {
            setGreska('Nije moguće učitati porudžbine. Pokušaj ponovo.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { ucitaj(stranica); }, [stranica, ucitaj]);

    // Katalog za "poruči ponovo" — mapa naziv → proizvod
    useEffect(() => {
        proizvodiApi.getSvi()
            .then(lista => setProizvodiPoNazivu(new Map(lista.map(p => [p.naziv, p]))))
            .catch(() => { });
    }, []);

    // Katalog nosi i dodatke (tip=Dodaci), pa se i oni traže po nazivu.
    // Nedostupno se preskače ovde — inače bi backend odbio celu porudžbinu na kasi.
    const nadjiDostupan = (naziv: string): Proizvod | null => {
        const p = proizvodiPoNazivu.get(naziv);
        return p && p.dostupan !== false ? p : null;
    };

    const napuniKorpu = (p: Porudzbina, zameni: boolean) => {
        if (zameni) isprazni();

        let dodato = 0;
        let preskoceno = 0;
        let dodaciPreskoceni = 0;

        for (const s of p.stavke) {
            const proizvod = nadjiDostupan(s.nazivProizvoda);
            if (!proizvod) { preskoceno++; continue; }

            const dodaci: DodatakKorpe[] = [];
            for (const d of s.dodaci ?? []) {
                const dodatak = nadjiDostupan(d.nazivProizvoda);
                if (dodatak) dodaci.push({ proizvod: dodatak, kolicina: d.kolicina });
                else dodaciPreskoceni++;
            }

            dodaj(proizvod, s.kolicina, dodaci);
            dodato++;
        }

        if (dodato === 0) {
            prikaziToast('Nijedan proizvod iz ove porudžbine nije dostupan danas.');
            return;
        }

        // Šta je izostavljeno ide u korpu, ne u toast: korpa se odmah otvara
        // preko toasta, a i sama je korak provere pre naručivanja.
        const izostavljeno = [
            ...(preskoceno > 0 ? [`${preskoceno} proizvod(a) više nije na meniju`] : []),
            ...(dodaciPreskoceni > 0 ? [`${dodaciPreskoceni} dodatak(a) trenutno nema`] : []),
        ];
        postaviPorukuKorpe(
            izostavljeno.length > 0
                ? `Dodato bez onoga čega nema: ${izostavljeno.join(', ')}.`
                : null
        );
        otvoriDrawer();
    };

    // Prazna korpa se puni bez pitanja; ako u njoj već nešto stoji, kupac bira
    // da li da je zameni ili dopuni — brisanje korpe se ne može poništiti.
    const poruciPonovo = (p: Porudzbina) => {
        if (korpa.length > 0) {
            setZameniModal(p);
            return;
        }
        napuniKorpu(p, false);
    };


    // Aktivna porudžbina (NOVA/U_PRIPREMI/SPREMNA) — velika narudžbenica na vrhu.
    const aktivna = useMemo(
        () => porudzbine.find(p => p.status === 'NOVA' || p.status === 'U_PRIPREMI' || p.status === 'SPREMNA') ?? null,
        [porudzbine]
    );
    const istorija = aktivna
        ? porudzbine.filter(p => p.porudzbinaId !== aktivna.porudzbinaId)
        : porudzbine;

    // PrivateRoute garantuje login
    if (!korisnik || !token) return null;

    // Minuti za aktivnu — iz konteksta ako je to porudžbina koju floating dugme prati
    const aktivniMin = aktivna && aktivna.porudzbinaId === aktivnaId
        ? preostaloMin
        : (aktivna?.procenjenoVreme ?? null);
    const aktivniKorak = aktivna ? korakIndex(aktivna.status) : 0;

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
                <span className={styles.eyeb}>tvoje </span>
                <div className={styles.glava}>
                    <h1 className={styles.naslov}>Porudžbine</h1>
                    {ukupnoStavki > 0 && (
                        <span className={styles.ukupno}>ukupno {ukupnoStavki}</span>
                    )}
                </div>

                {greska && <p className={styles.greska}>{greska}</p>}

                {loading && (
                    <div className={styles.lista} style={{ marginTop: 30 }}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className={styles.skeleton} />
                        ))}
                    </div>
                )}

                {/* Aktivna narudžbenica */}
                {!loading && aktivna && (
                    <motion.div
                        className={styles.aktivna}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => otvoriPracenje()}
                        style={{ cursor: 'pointer' }}
                    >
                        <span className={styles.aktivnaStiker}>
                            {aktivna.status === 'SPREMNA' ? 'spremna — dođi po nju!'
                                : aktivna.status === 'U_PRIPREMI' ? 'upravo se sprema'
                                    : 'čekamo potvrdu kuhinje'}
                        </span>
                        <div className={styles.aktivnaGlava}>
                            <div className={styles.aktivnaLevo}>
                                <span className={styles.tacka} />
                                <span className={styles.aktivnaId}>Porudžbina #{aktivna.porudzbinaId}</span>
                                {aktivna.tipPorudzbine && (
                                    <span className={styles.tipB}>{tipLabela(aktivna.tipPorudzbine)}</span>
                                )}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span className={styles.minBig}>
                                    {aktivna.status === 'SPREMNA' ? 'sad!'
                                        : aktivniMin !== null && aktivniMin > 0 ? `~${aktivniMin} min` : 'uskoro'}
                                </span>
                                <span className={styles.minNap}>do preuzimanja · osvežava se samo</span>
                            </div>
                        </div>

                        <div className={styles.koraci}>
                            <div className={styles.korakLinija} />
                            {KORACI.map((labela, i) => {
                                const proslo = i < aktivniKorak;
                                const aktivan = i === aktivniKorak;
                                return (
                                    <div key={labela} className={styles.korak}>
                                        <span className={
                                            proslo ? styles.tacProslo
                                                : aktivan ? styles.tacAktivna
                                                    : styles.tacBuduca
                                        }>
                                            {proslo ? '✓' : aktivan && i === 1 ? <Klose size={17} strokeWidth={2.4} /> : ''}
                                        </span>
                                        <span className={
                                            aktivan ? styles.korakLblAktivna
                                                : proslo ? styles.korakLbl
                                                    : styles.korakLblBuduca
                                        }>
                                            {labela}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={styles.aktivnaDno}>
                            <span className={styles.aktivnaStavke}>
                                {sazetakStavki(aktivna)} · <b>{aktivna.ukupanIznos.toLocaleString('sr-RS')} RSD</b>
                            </span>
                            <span className={styles.aktivnaNapomena}>otkazivanje je moguće samo na kasi</span>
                        </div>
                    </motion.div>
                )}

                {/* Prazno stanje */}
                {!loading && !greska && porudzbine.length === 0 && (
                    <motion.div
                        className={styles.prazno}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Sat size={74} strokeWidth={2.2} className={styles.praznoIkona} />
                        <h2 className={styles.praznoNaslov}>Još nema porudžbina.</h2>
                        <p className={styles.praznoTekst}>
                            Kad naručiš prvi put, ovde ćeš pratiti status i celu istoriju.
                        </p>
                        <Link to="/meni" className={styles.praznoLink}>Otvori meni →</Link>
                    </motion.div>
                )}

                {/* Istorija */}
                {!loading && istorija.length > 0 && (
                    <>
                        

                        <div className={styles.lista}>
                            {istorija.map(p => (
                                <Priznanica
                                    key={p.porudzbinaId}
                                    p={p}
                                    popust={p.originalnaCena && p.originalnaCena > p.ukupanIznos
                                        ? Math.round((1 - p.ukupanIznos / p.originalnaCena) * 100)
                                        : 0}
                                    onPoruciPonovo={poruciPonovo}
                                    onSacuvaj={id => setOmiljenaModal(id)}
                                    sacuvana={sacuvane.includes(p.porudzbinaId)}
                                />
                            ))}
                        </div>

                        {ukupnoStrana > 1 && (
                            <div className={styles.paginacija}>
                                <button
                                    className={styles.pagB}
                                    onClick={() => setStranica(s => s - 1)}
                                    disabled={stranica === 0}
                                    aria-label="Prethodna"
                                >‹</button>
                                {Array.from({ length: ukupnoStrana }).map((_, i) => (
                                    <button
                                        key={i}
                                        className={i === stranica ? styles.pagBAktivan : styles.pagB}
                                        onClick={() => setStranica(i)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    className={styles.pagB}
                                    onClick={() => setStranica(s => s + 1)}
                                    disabled={stranica === ukupnoStrana - 1}
                                    aria-label="Sledeća"
                                >›</button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <AnimatePresence>
                {omiljenaModal !== null && (
                    <OmiljenaModal
                        porudzbinaId={omiljenaModal}
                        onZatvori={() => setOmiljenaModal(null)}
                        onUspeh={() => {
                            setSacuvane(prev => [...prev, omiljenaModal]);
                            setOmiljenaModal(null);
                            prikaziToast('Sačuvano kao omiljena porudžbina!');
                        }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {zameniModal && (
                    <ZameniKorpuModal
                        brojStavki={korpa.length}
                        onZameni={() => { napuniKorpu(zameniModal, true); setZameniModal(null); }}
                        onDodaj={() => { napuniKorpu(zameniModal, false); setZameniModal(null); }}
                        onZatvori={() => setZameniModal(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
