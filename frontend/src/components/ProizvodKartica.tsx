import { motion, AnimatePresence } from 'motion/react';
import styles from './ProizvodKartica.module.css';
import React from 'react';
import type { Proizvod } from '../types/proizvod';
import { Klose } from './Doodle';

interface Props {
    proizvod: Proizvod;
    kolicina: number;
    popust: number;
    onDodaj: (proizvod: Proizvod) => void;
    onPovecaj: (id: number) => void;
    onSmanji: (id: number) => void;
    onOtvoriDetalj: (proizvod: Proizvod) => void;
}

// Red u meniju ostaje čist (bez alergena) — klik na red otvara detalj proizvoda.
function ProizvodKartica({
    proizvod, kolicina, popust,
    onDodaj, onPovecaj, onSmanji, onOtvoriDetalj,
}: Props) {
    const cena = Math.round(proizvod.cena);
    const cenaSaPopustom = popust > 0 ? Math.round(cena * (1 - popust / 100)) : null;

    return (
        <motion.div
            className={styles.red}
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
                <h3 className={styles.naziv}>{proizvod.naziv}</h3>
                {proizvod.opis && <p className={styles.opis}>{proizvod.opis}</p>}
            </div>

            <span className={styles.dots} />

            {cenaSaPopustom !== null && (
                <span className={styles.cenaStara}>{cena}</span>
            )}
            <span className={styles.cena}>
                {cenaSaPopustom ?? cena}<span className={styles.rsd}>RSD</span>
            </span>

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
                            onClick={() => onSmanji(proizvod.id)}
                            whileTap={{ scale: 0.85 }}
                        >
                            −
                        </motion.button>
                        <span className={styles.qtyBroj}>{kolicina}</span>
                        <motion.button
                            className={styles.qtyBtn}
                            onClick={() => onPovecaj(proizvod.id)}
                            whileTap={{ scale: 0.85 }}
                        >
                            +
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default React.memo(ProizvodKartica);
