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
    popust: number;
    onDodaj: (proizvod: Proizvod) => void;
    onPovecaj: (id: number) => void;
    onSmanji: (id: number) => void;
}

function ProizvodKartica({ proizvod, kolicina, popust, onDodaj, onPovecaj, onSmanji }: Props) {
    const cena = Math.round(proizvod.cena);
    const cenaSaPopustom = popust > 0 ? Math.round(cena * (1 - popust / 100)) : null;

    return (
        <motion.div
            className={styles.red}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            layout
        >
            <div className={styles.levo}>
                <h3 className={styles.naziv}>{proizvod.naziv}</h3>
                {proizvod.opis && <p className={styles.opis}>{proizvod.opis}</p>}
                {proizvod.alergeniNazivi && proizvod.alergeniNazivi.length > 0 && (
                    <p className={styles.alergeni}>Alergeni: {proizvod.alergeniNazivi.join(', ')}</p>
                )}
            </div>

            <div className={styles.desno}>
                <div className={styles.cenaWrap}>
                    {cenaSaPopustom ? (
                        <>
                            <span className={styles.cenaStara}>{cena} RSD</span>
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
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                        >
                            <Plus size={13} />
                            Dodaj
                        </motion.button>
                    ) : (
                        <motion.div
                            key="kontrole"
                            className={styles.kontrole}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.15 }}
                        >
                            <motion.button
                                className={styles.kontroleBtn}
                                onClick={() => onSmanji(proizvod.id)}
                                whileTap={{ scale: 0.85 }}
                            >
                                <Minus size={12} />
                            </motion.button>
                            <span className={styles.kolicina}>{kolicina}</span>
                            <motion.button
                                className={styles.kontroleBtn}
                                onClick={() => onPovecaj(proizvod.id)}
                                whileTap={{ scale: 0.85 }}
                            >
                                <Plus size={12} />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

export default React.memo(ProizvodKartica);
