import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAktivnaPorudzbina } from '../context/AktivnaPorudzbinaContext';
import { Korpa, Klose } from './Doodle';
import styles from './FloatingBubble.module.css';

function useIsDesktop() {
    const [isDesktop, setIsDesktop] = useState(() => window.innerWidth > 1000);
    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1001px)');
        const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);
    return isDesktop;
}

function formatirajCenu(cena: number): string {
    return `${cena.toLocaleString('sr-RS')} RSD`;
}

/**
 * Floating dugme, dole desno na svakoj strani — tri stanja:
 * prazna korpa (utišano), stavke u korpi (pilula sa cenom),
 * aktivna porudžbina (zeleno pulsira — uvek pobedi korpu).
 */
export default function FloatingBubble() {
    const { ukupnoStavki, ukupnaCena, otvoriDrawer } = useCart();
    const { aktivnaId, porudzbina, preostaloMin, otvoriPracenje } = useAktivnaPorudzbina();
    const { pathname } = useLocation();
    const isDesktop = useIsDesktop();

    const aktivna = aktivnaId !== null;
    const spremna = porudzbina?.status === 'SPREMNA' || porudzbina?.status === 'REALIZOVANA';

    // Na Meniju (desktop) korpa već stoji desno — dugme se krije dok nema aktivne porudžbine.
    if (!aktivna && isDesktop && pathname === '/meni') return null;
    // Na panelu zaposlenih dugme nema smisla.
    if (pathname === '/panel') return null;

    const badge = spremna
        ? 'spremna!'
        : preostaloMin !== null
            ? (preostaloMin > 0 ? `~${preostaloMin} min` : 'još malo…')
            : null;

    if (aktivna) {
        return (
            <div className={styles.wrap}>
                <motion.button
                    className={`${styles.bub} ${styles.ziv}`}
                    onClick={otvoriPracenje}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileTap={{ scale: 0.92 }}
                    aria-label="Praćenje porudžbine"
                >
                    <Klose size={24} />
                    {badge && <span className={styles.minBadge}>{badge}</span>}
                </motion.button>
            </div>
        );
    }

    const imaStavki = ukupnoStavki > 0;

    return (
        <div className={styles.wrap}>
            <motion.button
                className={`${styles.bub} ${imaStavki ? styles.pilula : styles.prazna}`}
                onClick={otvoriDrawer}
                // "Poskok" na svaku dodatu stavku
                key={ukupnoStavki}
                initial={false}
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 0.35 }}
                whileTap={{ scale: 0.92 }}
                aria-label="Korpa"
            >
                <Korpa size={imaStavki ? 20 : 24} />
                {imaStavki && (
                    <>
                        <motion.span
                            className={styles.cena}
                            key={ukupnaCena}
                            initial={{ scale: 1.15 }}
                            animate={{ scale: 1 }}
                        >
                            {formatirajCenu(ukupnaCena)}
                        </motion.span>
                        <span className={styles.badge}>{ukupnoStavki}</span>
                    </>
                )}
            </motion.button>
        </div>
    );
}
