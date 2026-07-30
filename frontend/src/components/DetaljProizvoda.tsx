import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TIP_DODACI, type DodatakKorpe, type Proizvod } from '../types/proizvod';
import { cenaJedinice, zaokruzi } from '../utils/korpa';
import { useDodaci } from '../hooks/useDodaci';
import { Klose } from './Doodle';
import styles from './DetaljProizvoda.module.css';

interface Props {
    proizvod: Proizvod | null;
    popust: number;
    onDodaj: (proizvod: Proizvod, kolicina: number, dodaci: DodatakKorpe[]) => void;
    onZatvori: () => void;
}

/**
 * Detalj proizvoda — klik na red u meniju otvara ovaj papirić
 * (popup na desktopu, bottom sheet na mobilnom). Alergeni i izbor dodataka
 * žive ovde, red u meniju ostaje čist. ESC / klik van zatvara.
 */
export default function DetaljProizvoda({ proizvod, popust, onDodaj, onZatvori }: Props) {
    const [kolicina, setKolicina] = useState(1);
    const [izabrani, setIzabrani] = useState<number[]>([]);

    useEffect(() => {
        setKolicina(1);
        setIzabrani([]);
    }, [proizvod?.id]);

    // Dodatke dobijaju samo stavke sa ukusom (piće ih nema), i sami dodaci ne.
    // Lista je keširana po ukusu, pa je posle prvog dohvatanja otvaranje trenutno.
    const primaDodatke = !!proizvod?.ukus && proizvod.tip !== TIP_DODACI;
    const { dodaci, ucitava: dodaciUcitavaju } = useDodaci(primaDodatke ? proizvod?.ukus : null);

    useEffect(() => {
        if (!proizvod) return;
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onZatvori();
        };
        document.addEventListener('keydown', onEsc);
        return () => document.removeEventListener('keydown', onEsc);
    }, [proizvod, onZatvori]);

    // Dok je papirić otvoren, strana iza ne sme da skroluje. Skrol kontejner je
    // <html>, pa se zaključava on; padding nadoknađuje širinu skrol trake da
    // sadržaj ne poskoči kad ona nestane.
    useEffect(() => {
        if (!proizvod) return;
        const html = document.documentElement;
        const sirinaTrake = window.innerWidth - html.clientWidth;
        const staroOverflow = html.style.overflow;
        const staroPadding = document.body.style.paddingRight;

        html.style.overflow = 'hidden';
        if (sirinaTrake > 0) document.body.style.paddingRight = `${sirinaTrake}px`;

        return () => {
            html.style.overflow = staroOverflow;
            document.body.style.paddingRight = staroPadding;
        };
    }, [proizvod]);

    // Izabrani dodaci kao stavke korpe (količina 1 po jedinici proizvoda).
    const izabraniDodaci: DodatakKorpe[] = dodaci
        .filter(d => izabrani.includes(d.id))
        .map(d => ({ proizvod: d, kolicina: 1 }));

    const toggleDodatak = (id: number) =>
        setIzabrani(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    // Cena po jedinici uključuje izabrane dodatke. Bez popusta — on se primenjuje
    // jednom na ukupan iznos u korpi, kao i na kasi.
    const cena = proizvod ? zaokruzi(cenaJedinice(proizvod, izabraniDodaci)) : 0;

    return (
        <AnimatePresence>
            {proizvod && (
                <motion.div
                    className={styles.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onZatvori}
                >
                    <motion.div
                        className={styles.kartica}
                        initial={{ opacity: 0, y: 40, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        onClick={e => e.stopPropagation()}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.6 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 90) onZatvori();
                        }}
                    >
                        <span className={styles.tape} />
                        <div className={styles.rucka} />
                        <button className={styles.zatvori} onClick={onZatvori} aria-label="Zatvori">✕</button>

                        <div className={styles.telo}>
                            <div className={styles.slikaOkvir} aria-hidden="true">
                                <Klose size={64} strokeWidth={1.6} />
                            </div>
                            <div className={styles.info}>
                                <span className={styles.eyeb}>{proizvod.tip.toLowerCase()}</span>
                                <h2 className={styles.naslov}>{proizvod.naziv}</h2>

                                {proizvod.opis && <p className={styles.opis}>{proizvod.opis}</p>}

                                {proizvod.alergeniNazivi && proizvod.alergeniNazivi.length > 0 && (
                                    <>
                                        <span className={styles.sekcLab}>alergeni</span>
                                        <div className={styles.alergeni}>
                                            {proizvod.alergeniNazivi.map(a => (
                                                <span key={a} className={styles.alPil}>{a}</span>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {dodaciUcitavaju && (
                                    <>
                                        <span className={styles.sekcLab}>dodaci</span>
                                        <div className={styles.dodaciLista} aria-busy="true">
                                            {Array.from({ length: 6 }).map((_, i) => (
                                                <span key={i} className={styles.dodatakSkelet} aria-hidden="true" />
                                            ))}
                                        </div>
                                    </>
                                )}

                                {!dodaciUcitavaju && dodaci.length > 0 && (
                                    <>
                                        <span className={styles.sekcLab}>dodaci</span>
                                        <div className={styles.dodaciLista}>
                                            {dodaci.map(d => {
                                                const cekiran = izabrani.includes(d.id);
                                                return (
                                                    <button
                                                        key={d.id}
                                                        type="button"
                                                        className={`${styles.dodatak} ${cekiran ? styles.dodatakOn : ''}`}
                                                        onClick={() => toggleDodatak(d.id)}
                                                        aria-pressed={cekiran}
                                                    >
                                                        <span className={styles.dodatakKvadrat} aria-hidden="true">
                                                            {cekiran ? '✓' : ''}
                                                        </span>
                                                        <span className={styles.dodatakNaziv}>{d.naziv}</span>
                                                        <span className={styles.dodatakCena}>+{Math.round(d.cena)}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className={styles.dno}>
                            <span>
                                <span className={styles.cena}>
                                    {cena}<span className={styles.rsd}>RSD</span>
                                </span>
                                {popust > 0 && (
                                    <span className={styles.popustNapomena}>
                                        tvoj popust −{popust}% ide na ukupan račun
                                    </span>
                                )}
                            </span>
                            <span className={styles.akcije}>
                                <span className={styles.qty}>
                                    <button
                                        className={styles.qtyBtn}
                                        onClick={() => setKolicina(k => Math.max(1, k - 1))}
                                    >
                                        −
                                    </button>
                                    <span className={styles.qtyBroj}>{kolicina}</span>
                                    <button
                                        className={styles.qtyBtn}
                                        onClick={() => setKolicina(k => k + 1)}
                                    >
                                        +
                                    </button>
                                </span>
                                <button
                                    className={styles.dodaj}
                                    onClick={() => {
                                        onDodaj(proizvod, kolicina, izabraniDodaci);
                                        onZatvori();
                                    }}
                                >
                                    Dodaj u korpu
                                </button>
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
