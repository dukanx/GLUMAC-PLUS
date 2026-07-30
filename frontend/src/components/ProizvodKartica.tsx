import { motion, AnimatePresence } from 'motion/react';
import styles from './ProizvodKartica.module.css';
import React from 'react';
import { TIP_DODACI, type Proizvod } from '../types/proizvod';
import { zaokruzi } from '../utils/korpa';
import { Klose } from './Doodle';

interface Props {
    proizvod: Proizvod;
    /** Ukupno komada u korpi, kroz sve varijante dodataka. */
    kolicina: number;
    onDodaj: (proizvod: Proizvod) => void;
    onPovecaj: (proizvod: Proizvod) => void;
    onSmanji: (proizvod: Proizvod) => void;
    onOtvoriDetalj: (proizvod: Proizvod) => void;
}

// Red u meniju ostaje čist (bez alergena) — klik na red otvara detalj proizvoda.
function ProizvodKartica({
    proizvod, kolicina,
    onDodaj, onPovecaj, onSmanji, onOtvoriDetalj,
}: Props) {
    // Puna cena, bez sniženja po komadu. Popust se primenjuje jednom na ukupan
    // iznos u korpi — isto kao što ga kasa računa. Da kartica pokazuje sniženu
    // cenu, zbir komada se ne bi poklopio sa iznosom na računu.
    const cena = zaokruzi(proizvod.cena);
    const dostupan = proizvod.dostupan !== false;
    // Dodatke primaju samo stavke sa ukusom (piće ih nema), i sami dodaci ne.
    const primaDodatke = !!proizvod.ukus && proizvod.tip !== TIP_DODACI;

    return (
        <motion.div
            className={`${styles.red} ${!dostupan ? styles.redNedostupno : ''}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            layout
            onClick={() => onOtvoriDetalj(proizvod)}
        >
            <div className={styles.thumb} aria-hidden="true">
                <Klose size={30} strokeWidth={1.8} />
            </div>
            <div className={styles.levo}>
                <h3 className={styles.naziv}>
                    {proizvod.naziv}
                    {!dostupan && <span className={styles.nemaDanasTag}>nema danas</span>}
                </h3>
                {proizvod.opis && <p className={styles.opis}>{proizvod.opis}</p>}
                {primaDodatke && dostupan && (
                    <span className={styles.dodaciPil}>+ dodaci</span>
                )}
            </div>

            <span className={styles.dots} />

            <span className={styles.cena}>
                {cena}<span className={styles.rsd}>RSD</span>
            </span>

            {!dostupan ? (
                <span className={styles.nedostupnoBtn} aria-label="Trenutno nedostupno">✕</span>
            ) : (
            <AnimatePresence mode="wait">
                {kolicina === 0 ? (
                    <motion.button
                        key="dodaj"
                        className={styles.plusBtn}
                        onClick={e => { e.stopPropagation(); onDodaj(proizvod); }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        aria-label={`Dodaj ${proizvod.naziv}`}
                    >
                        +
                    </motion.button>
                ) : (
                    <motion.div
                        key="kontrole"
                        className={styles.qty}
                        onClick={e => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                    >
                        <motion.button
                            className={styles.qtyBtn}
                            onClick={() => onSmanji(proizvod)}
                            whileTap={{ scale: 0.85 }}
                        >
                            −
                        </motion.button>
                        <span className={styles.qtyBroj}>{kolicina}</span>
                        <motion.button
                            className={styles.qtyBtn}
                            onClick={() => onPovecaj(proizvod)}
                            whileTap={{ scale: 0.85 }}
                        >
                            +
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
            )}
        </motion.div>
    );
}

export default React.memo(ProizvodKartica);
