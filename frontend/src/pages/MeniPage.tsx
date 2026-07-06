import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Clock, Star, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import styles from './MeniPage.module.css';
import ProizvodKartica from '../components/ProizvodKartica';
import MeniSkeleton from '../components/MeniSkeleton';
import MiniKorpa from '../components/MiniKorpa';
import Toast from '../components/Toast';
import { useRadnoVreme } from '../hooks/useRadnoVreme';
import type { Proizvod } from '../types/proizvod';

// ── Konstante ──────────────────────────────────────────────────────────────
const TELEFON = '+381 65 817 8476';
const ADRESA = 'Dositejeva 1a, Dorćol, Beograd';
const MAPS_URL = 'https://www.google.com/maps/place/glumac+plus/data=!4m2!3m1!1s0x475a7bc2e551cbab:0xb7899385a5114972?sa=X&ved=1t:242&ictx=111';

// Normalizacija teksta za pretragu (uklanjanje dijakritičkih znakova, mala slova)
function normalizuj(tekst: string): string {
    return tekst
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'dj');
}

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

// ── Komponenta ─────────────────────────────────────────────────────────────
export default function MeniPage() {
    const { korpa, dodaj, povecaj, smanji } = useCart();
    const { korisnik, popust } = useAuth();
    const { raspored, danas, danasKljuc, loading: radnoVremeLoading, imaPodataka } = useRadnoVreme();

    const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
    const [greska, setGreska] = useState('');
    const [ucitava, setUcitava] = useState(true);
    const [pretraga, setPretraga] = useState('');
    const [aktivniTab, setAktivniTab] = useState('Sve');
    const [toastPoruka, setToastPoruka] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${API}/api/proizvodi`)
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => { setProizvodi(data); setUcitava(false); })
            .catch(() => { setGreska('Ne mogu da učitam meni.'); setUcitava(false); });
    }, []);

    const kategorije = useMemo(() => {
        const tipovi = [...new Set(proizvodi.map(p => p.tip))];
        return ['Sve', ...tipovi];
    }, [proizvodi]);

    const filtrirani = useMemo(() =>
        proizvodi.filter(p => {
            const okTab = aktivniTab === 'Sve' || p.tip === aktivniTab;
            const okPretraga = normalizuj(p.naziv).includes(normalizuj(pretraga));
            return okTab && okPretraga;
        }),
        [proizvodi, aktivniTab, pretraga]
    );

    const grupisani = useMemo(() => {
        if (aktivniTab !== 'Sve') {
            return [{ tip: aktivniTab, stavke: filtrirani }];
        }
        return kategorije
            .filter(k => k !== 'Sve')
            .map(tip => ({ tip, stavke: filtrirani.filter(p => p.tip === tip) }))
            .filter(g => g.stavke.length > 0);
    }, [aktivniTab, filtrirani, kategorije]);

    const handleDodaj = useCallback((p: Proizvod) => {
        dodaj(p);
        setToastPoruka(`${p.naziv} dodata u korpu`);
        setTimeout(() => setToastPoruka(null), 2500);
    }, [dodaj]);

    return (
        <div className={styles.stranica}>

            {/* ── HEADER ── */}
            <header className={styles.pageHeader}>
                <div className={styles.pageHeaderSadrzaj}>
                    <span className={styles.oznaka}>Poručivanje</span>
                    <div className={styles.linija} />
                    <h1 className={styles.naslov}>Meni</h1>
                    <div className={styles.infoTagovi}>
                        <div className={styles.infoTag}>
                            <Star size={11} strokeWidth={1.5} />
                            Skupljaj loyalty bodove uz svaku porudžbinu
                        </div>
                        <div className={styles.infoTag}>
                            <ShoppingBag size={11} strokeWidth={1.5} />
                            Bez dostave — porudžbinu preuzimaš lično
                        </div>
                    </div>
                    {korisnik && popust > 0 && (
                        <div className={styles.loyaltyBaner}>
                            <Star size={12} strokeWidth={1.5} />
                            {korisnik.loyaltyNivo} — popust: <strong>{popust}%</strong>
                        </div>
                    )}
                </div>
            </header>

            {/* ── INFO SEKCIJA (lokacija, telefon, radno vreme) ── */}
            <section className={styles.infoSekcija}>
                <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.infoLink}
                >
                    <MapPin size={12} strokeWidth={1.5} className={styles.infoIkona} />
                    <span>{ADRESA}</span>
                </a>

                <a href={`tel:${TELEFON.replace(/\s/g, '')}`} className={styles.infoLink}>
                    <Phone size={12} strokeWidth={1.5} className={styles.infoIkona} />
                    <span>{TELEFON}</span>
                </a>

                <div className={styles.rasporedBlok}>
                    <div className={styles.rasporedGlava}>
                        <Clock size={12} strokeWidth={1.5} className={styles.infoIkona} />
                        <span>Radno vreme</span>
                    </div>
                    {radnoVremeLoading ? (
                        <p className={styles.rasporedFallback}>Učitavam...</p>
                    ) : !imaPodataka ? (
                        <p className={styles.rasporedFallback}>Radno vreme privremeno nedostupno.</p>
                    ) : (
                        <>
                            {/* Pun raspored — desktop/tablet */}
                            <div className={styles.rasporedGrid}>
                                {raspored.map(({ dan, skracenica, vreme }) => (
                                    <div
                                        key={dan}
                                        className={`${styles.rasporedDan} ${dan === danasKljuc ? styles.danasnji : ''}`}
                                    >
                                        <span className={styles.rasporedSkracenica}>{skracenica}</span>
                                        <span className={styles.rasporedVreme}>{vreme ?? 'zatv.'}</span>
                                    </div>
                                ))}
                            </div>
                            {/* Samo današnji dan — mobilni */}
                            {danas && (
                                <div className={styles.rasporedDanas}>
                                    <span className={styles.rasporedDanasDan}>Danas · {danas.skracenica}</span>
                                    <span className={styles.rasporedDanasVreme}>
                                        {danas.vreme ?? 'zatvoreno'}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* ── KONTROLE (tabovi, sticky) ── */}
            <div className={styles.kontrole}>
                <div className={styles.tabovi}>
                    {kategorije.map(kat => (
                        <button
                            key={kat}
                            className={`${styles.tab} ${aktivniTab === kat ? styles.tabAktivan : ''}`}
                            onClick={() => setAktivniTab(kat)}
                        >
                            {kat}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── SADRŽAJ (dva stuba na desktopu) ── */}
            <main className={styles.sadrzaj}>
                <div className={styles.sadrzajInner}>

                    {/* Levo — lista proizvoda */}
                    <div className={styles.produkti}>
                        <div className={styles.searchWrap}>
                            <span className={styles.searchIkona}>⌕</span>
                            <input
                                type="text"
                                placeholder="Pretraži..."
                                value={pretraga}
                                onChange={e => setPretraga(e.target.value)}
                                className={styles.searchInput}
                            />
                            {pretraga && (
                                <button className={styles.searchBrisi} onClick={() => setPretraga('')}>×</button>
                            )}
                        </div>

                        {greska && <p className={styles.greska}>{greska}</p>}

                        {ucitava && <MeniSkeleton />}

                        {!ucitava && filtrirani.length === 0 && !greska && (
                            <div className={styles.praznoStanje}>
                                <p className={styles.praznoTekst}>Nema rezultata</p>
                                {pretraga && (
                                    <p className={styles.praznoHint}>
                                        Nismo pronašli ništa za „<em>{pretraga}</em>“
                                    </p>
                                )}
                            </div>
                        )}

                        {!ucitava && grupisani.map(({ tip, stavke }) => (
                            <div key={tip} className={styles.sekcija}>
                                {aktivniTab === 'Sve' && (
                                    <div className={styles.sekcijaGlava}>
                                        <span className={styles.sekcijaNaslov}>{tip}</span>
                                    </div>
                                )}
                                <motion.div
                                    className={styles.lista}
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        hidden: {},
                                        visible: { transition: { staggerChildren: 0.04 } },
                                    }}
                                >
                                    {stavke.map(p => (
                                        <ProizvodKartica
                                            key={p.id}
                                            proizvod={p}
                                            kolicina={korpa.find(i => i.proizvod.id === p.id)?.kolicina ?? 0}
                                            popust={popust}
                                            onDodaj={handleDodaj}
                                            onPovecaj={povecaj}
                                            onSmanji={smanji}
                                        />
                                    ))}
                                </motion.div>
                            </div>
                        ))}
                    </div>

                    {/* Desno — mini korpa (samo desktop) */}
                    <aside className={styles.korpaKolona}>
                        <MiniKorpa />
                    </aside>

                </div>
            </main>

            <Toast poruka={toastPoruka} />

        </div>
    );
}
