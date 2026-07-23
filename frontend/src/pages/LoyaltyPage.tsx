import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Katanac, NalogPlus, Kesa } from '../components/Doodle';
import type { Porudzbina } from '../types/porudzbina';
import * as porudzbineApi from '../api/porudzbine';
import styles from './LoyaltyPage.module.css';

// Datum aktivnosti — "danas", "juče" ili kratki datum
function formatirajDatum(iso: string): string {
    const d = new Date(iso);
    const danas = new Date();
    const juce = new Date();
    juce.setDate(danas.getDate() - 1);
    if (d.toDateString() === danas.toDateString()) return 'danas';
    if (d.toDateString() === juce.toDateString()) return 'juče';
    return d.toLocaleDateString('sr-RS', { day: 'numeric', month: 'long' });
}

// Count-up animacija broja (easeOutCubic)
function useCountUp(target: number, aktivan: boolean, trajanje = 1000): number {
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!aktivan) { setVal(target); return; }
        let raf = 0;
        const start = performance.now();
        const tick = (now: number) => {
            const p = Math.min(1, (now - start) / trajanje);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(target * eased));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, aktivan, trajanje]);
    return val;
}

// Ulazak sekcija pri skrolu
const ulazak = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

export default function LoyaltyPage() {
    const { korisnik, token, loyaltyProgrami, popust } = useAuth();
    const navigate = useNavigate();

    const [porudzbine, setPorudzbine] = useState<Porudzbina[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);

    // Statistika + aktivnosti iz istorije porudžbina
    useEffect(() => {
        if (!korisnik || !token) {
            setLoadingStats(false);
            return;
        }
        porudzbineApi.getMoje(0, 100)
            .then(data => {
                const lista = Array.isArray(data) ? data : (data.content ?? []);
                setPorudzbine(lista);
            })
            .catch(() => { })
            .finally(() => setLoadingStats(false));
    }, [korisnik, token]);

    // Nivoi sa backenda, sortirani po pragu
    const nivoi = useMemo(
        () => [...loyaltyProgrami].sort((a, b) => a.pragBodova - b.pragBodova),
        [loyaltyProgrami]
    );

    const bodovi = korisnik?.brojBodova ?? 0;
    const bodoviPrikaz = useCountUp(bodovi, !!korisnik);
    const trenutniNivo = [...nivoi].reverse().find(n => bodovi >= n.pragBodova) ?? nivoi[0];
    const sledeciNivo = nivoi.find(n => n.pragBodova > bodovi);

    let procenat = 100;
    let preostalo = 0;
    if (sledeciNivo && trenutniNivo) {
        const opseg = sledeciNivo.pragBodova - trenutniNivo.pragBodova;
        const osvojeno = bodovi - trenutniNivo.pragBodova;
        procenat = opseg > 0 ? Math.round((osvojeno / opseg) * 100) : 100;
        preostalo = sledeciNivo.pragBodova - bodovi;
    }

    const sad = new Date();
    const ovajMesec = porudzbine.filter(p => {
        const d = new Date(p.datum);
        return d.getFullYear() === sad.getFullYear()
            && d.getMonth() === sad.getMonth()
            && p.status === 'REALIZOVANA';
    }).length;

    const ustedeno = Math.round(porudzbine.reduce((sum, p) => {
        if (p.originalnaCena != null && p.originalnaCena > p.ukupanIznos) {
            return sum + (p.originalnaCena - p.ukupanIznos);
        }
        return sum;
    }, 0));

    // Poslednje aktivnosti — realizovane porudžbine donose bodove
    const aktivnosti = porudzbine
        .filter(p => p.status === 'REALIZOVANA')
        .slice(0, 4);

    return (
        <div className={styles.stranica}>

            {/* ── Tamni filmski hero ── */}
            <section className={styles.hero}>
                <h1 className={styles.heroNaslov}>
                    {korisnik ? (
                        <>Tvoji <em className={styles.heroAkcenat}>bodovi.</em></>
                    ) : (
                        <>Naruči. Skupi bodove. <em className={styles.heroAkcenat}>Plati manje.</em></>
                    )}
                </h1>
                <p className={styles.heroLede}>
                    <span>100 RSD = 1 bod</span>
                    <span className={styles.heroLedeDrugi}>
                        {korisnik
                            ? 'popust se primenjuje automatski pri svakoj porudžbini'
                            : 'popust na svaku porudžbinu'}
                    </span>
                </p>
            </section>

            {/* ── Ulaznica ── */}
            <div className={styles.ulaznicaWrap}>
                <motion.div
                    className={styles.ulaznica}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    {!korisnik && (
                        <span className={styles.ulaznicaStiker}>ovako izgleda tvoja kartica</span>
                    )}

                    <div className={styles.ulazLevo}>
                        <div className={styles.ulazGlava}>
                            <span className={styles.ulazLabela}>ULAZNICA · LOYALTY</span>
                        </div>
                        <div className={styles.ulazImeRed}>
                            <h2 className={korisnik ? styles.ulazIme : styles.ulazImeGost}>
                                {korisnik?.ime ?? 'TVOJE IME'}
                            </h2>
                            {korisnik && trenutniNivo && (
                                <span className={styles.tren}>
                                    {trenutniNivo.nivo.toLowerCase()}{popust > 0 ? ` · −${popust}%` : ''}
                                </span>
                            )}
                        </div>

                        <div className={styles.ulazStats}>
                            {korisnik ? (
                                <>
                                    <div className={styles.ulazStat}>
                                        <div className={styles.bodoviRed}>
                                            <div className={styles.statBVeliki}>{bodoviPrikaz}</div>
                                            <div className={styles.bodoviLabela}><b>bodova</b><br />na računu</div>
                                        </div>
                                    </div>
                                    <div className={styles.ulazStat}>
                                        <div className={styles.statB}>
                                            {loadingStats ? '—' : ovajMesec}
                                        </div>
                                        <div className={styles.statL}>porudžbina ovaj mesec</div>
                                    </div>
                                    <div className={styles.ulazStat}>
                                        <div className={styles.statB}>
                                            {loadingStats ? '—' : ustedeno.toLocaleString('sr-RS')}
                                            <span className={styles.statRsd}> RSD</span>
                                        </div>
                                        <div className={styles.statL}>ušteđeno do sada</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className={styles.ulazStat}>
                                        <div className={styles.statBSivi}>0</div>
                                        <div className={styles.statL}>bodova — za sada</div>
                                    </div>
                                    <div className={styles.ulazStat}>
                                        <div className={styles.statBVeliki}>+bodovi</div>
                                        <div className={styles.statL}>već posle prve porudžbine</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Perforirani kupon */}
                    <div className={styles.ulazKupon}>
                        {korisnik ? (
                            sledeciNivo ? (
                                <>
                                    <div className={styles.kuponGlava}>
                                        <span className={styles.kuponEyeb}>sledeći nivo</span>
                                        <span className={styles.kuponNivo}>{sledeciNivo.nivo}</span>
                                        <span className={styles.kuponPopust}>−{sledeciNivo.popust}% na sve</span>
                                    </div>
                                    <div>
                                        <div className={styles.prTraka}>
                                            <motion.span
                                                className={styles.prFill}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.max(4, procenat)}%` }}
                                                transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                            />
                                        </div>
                                        <span className={styles.kuponJos}>
                                            još <b>{preostalo.toLocaleString('sr-RS')} bodova</b>
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <span className={styles.kuponEyeb}>čestitamo</span>
                                    <span className={styles.kuponNivo}>najviši nivo</span>
                                    <span className={styles.kuponPopust}>
                                        {popust > 0 ? `−${popust}% trajno` : 'dostignut'}
                                    </span>
                                </div>
                            )
                        ) : (
                            <>
                                <button className={styles.naruci} onClick={() => navigate('/register')}>
                                    Napravi nalog <NalogPlus size={23} strokeWidth={2.4} />
                                </button>
                                <Link to="/login" className={styles.kuponLink}>već imam nalog</Link>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* ── Sadržaj: put nivoa + aktivnosti ── */}
            <div className={korisnik ? styles.sadrzaj : styles.sadrzajGost}>
                <div>
                    <motion.div {...ulazak}>
                        <span className={styles.kSekc}>— nivoi</span>
                        <span className={styles.kSekcNap}>popust raste sa brojem skupljenih bodova</span>
                    </motion.div>

                    {nivoi.length > 0 && (
                        <div
                            className={styles.nivoi}
                            style={{ '--nivoi-cols': nivoi.length } as React.CSSProperties}
                        >
                            <svg className={styles.nivoiLinija} viewBox="0 0 800 20" fill="none" preserveAspectRatio="none">
                                <path d="M4 12 C 150 6, 300 15, 400 10 C 520 5, 680 14, 796 9"
                                    stroke="hsl(22 30% 14%/.3)" strokeWidth="3" strokeDasharray="10 8" strokeLinecap="round" />
                            </svg>
                            {nivoi.map((n, i) => {
                                const dostignut = korisnik !== null && bodovi >= n.pragBodova;
                                const trenutni = korisnik !== null && trenutniNivo?.id === n.id;
                                return (
                                    <motion.div
                                        key={n.id}
                                        className={styles.nivoWrap}
                                        initial={{ opacity: 0, y: 18 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.5 }}
                                        transition={{ delay: i * 0.09, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        <div className={trenutni ? styles.nivoTi : styles.nivo}>
                                            <motion.span
                                                className={
                                                    trenutni ? styles.zigTi
                                                        : dostignut ? styles.zig
                                                            : styles.zigBuduci
                                                }
                                                initial={{ scale: 1.7, rotate: -14, opacity: 0 }}
                                                whileInView={{ scale: 1, rotate: trenutni ? -3 : 0, opacity: 1 }}
                                                viewport={{ once: true, amount: 0.5 }}
                                                transition={{ delay: i * 0.09 + 0.12, type: 'spring', stiffness: 320, damping: 13 }}
                                            >
                                                {trenutni ? 'TI'
                                                    : dostignut ? '✓'
                                                        : <Katanac size={20} strokeWidth={2} />}
                                            </motion.span>
                                            <h3 className={
                                                trenutni ? styles.nivoNazTi
                                                    : dostignut ? styles.nivoNaz
                                                        : styles.nivoNazBuduci
                                            }>
                                                {n.nivo}
                                            </h3>
                                            <span className={styles.nivoPrag}>
                                                {n.pragBodova.toLocaleString('sr-RS')} bod. · {n.popust}%
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    <motion.div className={styles.kakoRadi} {...ulazak}>
                        <span className={styles.kakoRadiNaslov}>KAKO RADI</span>
                        <ul className={styles.kakoRadiLista}>
                            <li>svakih <b>100 RSD</b> ti donese <b>1 bod</b></li>
                            <li>bodovi se pripisuju kad  <b>preuzmeš</b> porudžbinu </li>
                            <li>popust važi za porudžbine <b>preko sajta</b> — ne za Wolt/Glovo</li>
                        </ul>
                    </motion.div>

                    <motion.div className={styles.dnoCta} {...ulazak}>
                        {korisnik && sledeciNivo ? (
                            <span className={styles.dnoCtaTekst}>
                                još {preostalo.toLocaleString('sr-RS')} bodova do sledećeg nivoa —
                            </span>
                        ) : !korisnik ? (
                            <span className={styles.dnoCtaTekst}>bodovi kreću od prve porudžbine </span>
                        ) : null}
                        <Link to="/meni" className={styles.naruci}>Poruči odmah <Kesa size={23} strokeWidth={2} /></Link>
                    </motion.div>
                </div>

                {/* Poslednje aktivnosti (samo ulogovan) */}
                {korisnik && (
                    <motion.div {...ulazak}>
                        <span className={styles.kSekc}>— poslednje aktivnosti</span>
                        <div style={{ marginTop: 18 }}>
                            {loadingStats ? (
                                <p className={styles.aktPrazno}>učitavam…</p>
                            ) : aktivnosti.length === 0 ? (
                                <p className={styles.aktPrazno}>
                                    još nema aktivnosti — bodovi stižu sa prvom preuzetom porudžbinom
                                </p>
                            ) : (
                                aktivnosti.map(p => (
                                    <div key={p.porudzbinaId} className={styles.aktRed}>
                                        <div style={{ minWidth: 0 }}>
                                            <span className={styles.aktNaziv}>
                                                Porudžbina #{p.porudzbinaId}
                                            </span>
                                            <span className={styles.aktDatum}>
                                                {formatirajDatum(p.datum)} · {p.ukupanIznos.toLocaleString('sr-RS')} RSD
                                            </span>
                                        </div>
                                        <span className={styles.aktRazmak} />
                                        <span className={styles.aktBodovi}>
                                            +{Math.floor(p.ukupanIznos / 100)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                        <Link to="/istorija" className={styles.aktLink}>sve porudžbine →</Link>

                        {popust > 0 && (
                            <div className={styles.popustPapiric}>
                                <span className={styles.popustPapiricEyeb}>tvoj popust te čeka</span>
                                <span className={styles.popustPapiricNaslov}>
                                    SLEDEĆA PORUDŽBINA: −{popust}%
                                </span>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
