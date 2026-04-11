import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus } from 'lucide-react';
import styles from './ProizvodKartica.module.css';
import React from 'react';

interface Proizvod {
    id: number;
    naziv: string;
    opis?: string;
    cena: number;
    tip: string;
    alergeniNazivi?: string[];
}

interface Props {
    proizvod: Proizvod;
    kolicina: number;
    slika: string;
    popust: number;
    onDodaj: (proizvod: Proizvod) => void;
    onPovecaj: (id: number) => void;
    onSmanji: (id: number) => void;
}

function ProizvodKartica({
    proizvod, kolicina, slika, popust, onDodaj, onPovecaj, onSmanji
}: Props) {
    const cena = Math.round(proizvod.cena);
    const cenaSaPopustom = popust > 0 ? Math.round(cena * (1 - popust / 100)) : null;
    return (
        <motion.div
            className={styles.kartica}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            layout
        >
            {/* Slika */}
            <div className={styles.slikaWrap}>
                <motion.img
                    src={slika}
                    alt={proizvod.naziv}
                    className={styles.slika}
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.4 }}
                />
                <span className={styles.tipBadge}>{proizvod.tip}</span>
            </div>

            {/* Tekst */}
            <div className={styles.tekst}>
                <h3 className={styles.naziv}>{proizvod.naziv}</h3>
                {proizvod.opis ? <p className={styles.opis}>{proizvod.opis}</p> : null}
                {proizvod.alergeniNazivi && proizvod.alergeniNazivi.length > 0 ? (
                    <p className={styles.alergeni}>
                        Alergeni: {proizvod.alergeniNazivi.join(', ')}
                    </p>
                ) : null}

                <div className={styles.footer}>
                    <div className={styles.cenaWrap}>
                        {cenaSaPopustom ? (
                            <>
                                <span className={styles.cenaStara}>{cena}</span>
                                <span className={styles.cenaPopust}>{cenaSaPopustom} RSD</span>
                            </>
                        ) : (
                            <span className={styles.cena}>{cena} RSD</span>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        {kolicina === 0 ? (
                            <motion.button
                                key="dodaj"
                                className={styles.dodajBtn}
                                onClick={() => onDodaj(proizvod)}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                whileTap={{ scale: 0.92 }}
                                transition={{ duration: 0.15 }}
                            >
                                <Plus size={15} />
                                Dodaj
                            </motion.button>
                        ) : (
                            <motion.div
                                key="kontrole"
                                className={styles.kontrole}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.15 }}
                            >
                                <motion.button
                                    className={styles.kontroleBtn}
                                    onClick={() => onSmanji(proizvod.id)}
                                    whileTap={{ scale: 0.85 }}
                                >
                                    <Minus size={13} />
                                </motion.button>
                                <span className={styles.kolicina}>{kolicina}</span>
                                <motion.button
                                    className={styles.kontroleBtn}
                                    onClick={() => onPovecaj(proizvod.id)}
                                    whileTap={{ scale: 0.85 }}
                                >
                                    <Plus size={13} />
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}

export default React.memo(ProizvodKartica);
