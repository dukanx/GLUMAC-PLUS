import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Proizvod } from '../types/proizvod';
import styles from './DetaljProizvoda.module.css';

interface Props {
    proizvod: Proizvod | null;
    popust: number;
    onDodaj: (proizvod: Proizvod, kolicina: number) => void;
    onZatvori: () => void;
}

/**
 * Detalj proizvoda — klik na red u meniju otvara ovaj papirić
 * (popup na desktopu, bottom sheet na mobilnom). Alergeni žive ovde,
 * red u meniju ostaje čist. ESC / klik van zatvara.
 */
export default function DetaljProizvoda({ proizvod, popust, onDodaj, onZatvori }: Props) {
    const [kolicina, setKolicina] = useState(1);

    useEffect(() => {
        setKolicina(1);
    }, [proizvod?.id]);

    useEffect(() => {
        if (!proizvod) return;
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onZatvori();
        };
        document.addEventListener('keydown', onEsc);
        return () => document.removeEventListener('keydown', onEsc);
    }, [proizvod, onZatvori]);

    const cena = proizvod ? Math.round(proizvod.cena) : 0;
    const cenaSaPopustom = popust > 0 ? Math.round(cena * (1 - popust / 100)) : null;

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

                        <div className={styles.dno}>
                            <span>
                                {cenaSaPopustom !== null && (
                                    <span className={styles.cenaStara}>{cena}</span>
                                )}
                                <span className={styles.cena}>
                                    {cenaSaPopustom ?? cena}<span className={styles.rsd}>RSD</span>
                                </span>
                                {cenaSaPopustom !== null && (
                                    <span className={styles.popustNapomena}>
                                        loyalty popust −{popust}%
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
                                        onDodaj(proizvod, kolicina);
                                        onZatvori();
                                    }}
                                >
                                    Dodaj u korpu →
                                </button>
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
