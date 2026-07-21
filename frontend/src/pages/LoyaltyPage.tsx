import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Katanac } from '../components/Doodle';
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
                    {korisnik
                        ? '100 RSD = 1 bod · popust se primenjuje automatski pri svakoj porudžbini'
                        : '100 RSD = 1 bod · popust na svaku porudžbinu · besplatno zauvek'}
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
                                        <div className={styles.statBVeliki}>{bodovi}</div>
                                        <div className={styles.statL}><b>bodova</b> na računu</div>
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
                                    <div>
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
                                <span className={styles.kuponTekst}>
                                    registracija traje minut, bodovi kreću od prve porudžbine
                                </span>
                                <button className={styles.naruci} onClick={() => navigate('/register')}>
                                    Napravi nalog →
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
                    <div>
                        <span className={styles.kSekc}>— nivoi</span>
                        <span className={styles.kSekcNap}>popust raste sa brojem skupljenih bodova</span>
                    </div>

                    {nivoi.length > 0 && (
                        <div
                            className={styles.nivoi}
                            style={{ gridTemplateColumns: `repeat(${nivoi.length}, 1fr)` }}
                        >
                            <svg className={styles.nivoiLinija} viewBox="0 0 800 20" fill="none" preserveAspectRatio="none">
                                <path d="M4 12 C 150 6, 300 15, 400 10 C 520 5, 680 14, 796 9"
                                    stroke="hsl(22 30% 14%/.3)" strokeWidth="3" strokeDasharray="10 8" strokeLinecap="round" />
                            </svg>
                            {nivoi.map(n => {
                                const dostignut = korisnik !== null && bodovi >= n.pragBodova;
                                const trenutni = korisnik !== null && trenutniNivo?.id === n.id;
                                return (
                                    <div key={n.id} className={trenutni ? styles.nivoTi : styles.nivo}>
                                        <span className={
                                            trenutni ? styles.zigTi
                                                : dostignut ? styles.zig
                                                    : styles.zigBuduci
                                        }>
                                            {trenutni ? 'TI'
                                                : dostignut ? '✓'
                                                    : <Katanac size={20} strokeWidth={2} />}
                                        </span>
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
                                );
                            })}
                        </div>
                    )}

                    <div className={styles.kakoRadi}>
                        <span className={styles.kakoRadiNaslov}>KAKO RADI</span>
                        <span className={styles.kakoRadiTekst}>
                            100 RSD = 1 bod · bodovi se pripisuju kad porudžbina bude preuzeta ·
                            nivo se ne gubi — jednom dostignut, ostaje ·
                            popust važi za porudžbine kroz sajt, ne za Wolt/Glovo
                        </span>
                    </div>

                    <div className={styles.dnoCta}>
                        {korisnik && sledeciNivo ? (
                            <span className={styles.dnoCtaTekst}>
                                još {preostalo.toLocaleString('sr-RS')} bodova do sledećeg nivoa —
                            </span>
                        ) : !korisnik ? (
                            <span className={styles.dnoCtaTekst}>bodovi kreću od prve porudžbine —</span>
                        ) : null}
                        <Link to="/meni" className={styles.naruci}>Poruči odmah →</Link>
                    </div>
                </div>

                {/* Poslednje aktivnosti (samo ulogovan) */}
                {korisnik && (
                    <div>
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
                    </div>
                )}
            </div>
        </div>
    );
}
