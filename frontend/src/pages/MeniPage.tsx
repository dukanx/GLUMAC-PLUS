import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import styles from './MeniPage.module.css';
import ProizvodKartica from '../components/ProizvodKartica';
import MeniSkeleton from '../components/MeniSkeleton';
import MiniKorpa from '../components/MiniKorpa';
import DetaljProizvoda from '../components/DetaljProizvoda';
import { Zvezda } from '../components/Doodle';
import { useRadnoVreme } from '../hooks/useRadnoVreme';
import type { Proizvod } from '../types/proizvod';
import * as proizvodiApi from '../api/proizvodi';

// ── Konstante ──────────────────────────────────────────────────────────────
const TELEFON = '+381 65 817 8476';
const ADRESA = 'Dositejeva 1a, Dorćol';
const MAPS_URL = 'https://www.google.com/maps/place/glumac+plus/data=!4m2!3m1!1s0x475a7bc2e551cbab:0xb7899385a5114972?sa=X&ved=1t:242&ictx=111';
const WOLT_URL = 'https://wolt.com/en/srb/belgrade/restaurant/palainkarnica-glumac-plus';
const GLOVO_URL = 'https://glovoapp.com/en/rs/belgrade/stores/glumac-plus-beg';

// Normalizacija teksta za pretragu (uklanjanje dijakritičkih znakova, mala slova)
function normalizuj(tekst: string): string {
    return tekst
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'dj');
}

// ── Komponenta ─────────────────────────────────────────────────────────────
export default function MeniPage() {
    const { korpa, dodaj, povecaj, smanji } = useCart();
    const { korisnik, popust } = useAuth();
    const { raspored, danasKljuc, loading: radnoVremeLoading, imaPodataka } = useRadnoVreme();

    const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
    const [greska, setGreska] = useState('');
    const [ucitava, setUcitava] = useState(true);
    const [pretraga, setPretraga] = useState('');
    const [aktivniTab, setAktivniTab] = useState('Sve');
    const [detalj, setDetalj] = useState<Proizvod | null>(null);

    useEffect(() => {
        proizvodiApi.getSvi()
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

    const handleDodaj = useCallback((p: Proizvod) => dodaj(p), [dodaj]);

    return (
        <div className={styles.stranica}>

            {/* ── Header ── */}
            <header className={styles.mhead}>
                <span className={styles.eyeb}>poručivanje — preuzimaš lično</span>
                <h1 className={styles.naslov}>Meni</h1>
                <div className={styles.infoTagovi}>
                    <span className={styles.infoTag}>
                        <Zvezda size={15} strokeWidth={2.6} />
                        skupljaš bodove uz svaku porudžbinu
                    </span>
                    <span className={styles.dostavaPitanje}>radije dostavu?</span>
                    <a
                        href={GLOVO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.infoTagGlovo}
                    >
                        Glovo ↗
                    </a>
                    <a
                        href={WOLT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.infoTagWolt}
                    >
                        Wolt ↗
                    </a>
                </div>
                {korisnik && popust > 0 && (
                    <div>
                        <span className={styles.loyBan}>
                            <Zvezda size={15} strokeWidth={2.6} style={{ color: 'var(--rust)' }} />
                            <span>
                                <b>{korisnik.loyaltyNivo}</b> — tvoj popust:{' '}
                                <b style={{ color: 'var(--rust)' }}>{popust}%</b>{' '}
                                <span className={styles.loyBanSivo}>· cene ispod su već preračunate</span>
                            </span>
                        </span>
                    </div>
                )}
            </header>

            {/* ── Info traka: adresa · telefon · radno vreme ── */}
            <section className={styles.infoStrip}>
                <div className={styles.infoBl}>
                    <span className={styles.infoBlH}>gde smo</span>
                    <a
                        href={MAPS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.infoBlLink}
                    >
                        {ADRESA} ↗
                    </a>
                </div>

                <div className={styles.infoBl}>
                    <span className={styles.infoBlH}>pozovi nas</span>
                    <a href={`tel:${TELEFON.replace(/\s/g, '')}`} className={styles.infoBlV}>
                        {TELEFON}
                    </a>
                </div>

                <div className={styles.infoBl}>
                    <span className={styles.infoBlH}>radno vreme</span>
                    {radnoVremeLoading ? (
                        <span className={styles.rvFallback}>učitavam…</span>
                    ) : !imaPodataka ? (
                        <span className={styles.rvFallback}>privremeno nedostupno</span>
                    ) : (
                        <div className={styles.rvGrid}>
                            {raspored.map(({ dan, skracenica, vreme }) => (
                                <div
                                    key={dan}
                                    className={dan === danasKljuc ? styles.rvDanas : styles.rvDan}
                                >
                                    <span className={styles.rvSkr}>{skracenica.toLowerCase()}</span>
                                    <span className={styles.rvVr}>{vreme ?? 'zatv.'}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── Tabovi ── */}
            <div className={styles.tabRow}>
                {kategorije.map(kat => (
                    <button
                        key={kat}
                        className={aktivniTab === kat ? styles.tabAktivan : styles.tab}
                        onClick={() => setAktivniTab(kat)}
                    >
                        {kat}
                    </button>
                ))}
            </div>

            {/* ── Sadržaj: lista + sticky korpa ── */}
            <main className={styles.sadrzaj}>
                <div>
                    <div className={styles.srch}>
                        <span className={styles.srchIkona}>⌕</span>
                        <input
                            type="text"
                            placeholder="pretraži meni..."
                            value={pretraga}
                            onChange={e => setPretraga(e.target.value)}
                            className={styles.srchInput}
                        />
                        {pretraga && (
                            <button className={styles.srchBrisi} onClick={() => setPretraga('')}>
                                ×
                            </button>
                        )}
                    </div>

                    {greska && <p className={styles.greska}>{greska}</p>}

                    {ucitava && <MeniSkeleton />}

                    {!ucitava && filtrirani.length === 0 && !greska && (
                        <div className={styles.prazno}>
                            <p className={styles.praznoTekst}>NEMA REZULTATA</p>
                            {pretraga && (
                                <p className={styles.praznoHint}>
                                    nismo pronašli ništa za „{pretraga}“
                                </p>
                            )}
                        </div>
                    )}

                    {!ucitava && grupisani.map(({ tip, stavke }, gi) => (
                        <div key={tip}>
                            {aktivniTab === 'Sve' && (
                                <p className={gi === 0 ? styles.prviKSekc : styles.kSekc}>
                                    — {tip.toLowerCase()}
                                </p>
                            )}
                            <motion.div
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
                                        onOtvoriDetalj={setDetalj}
                                    />
                                ))}
                            </motion.div>
                        </div>
                    ))}
                </div>

                {/* Desno — sticky korpa (samo desktop) */}
                <aside className={styles.korpaKolona}>
                    <MiniKorpa />
                </aside>
            </main>

            {/* Detalj proizvoda — popup / bottom sheet */}
            <DetaljProizvoda
                proizvod={detalj}
                popust={popust}
                onDodaj={(p, kolicina) => dodaj(p, kolicina)}
                onZatvori={() => setDetalj(null)}
            />
        </div>
    );
}
