import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ChefHat } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAktivnaPorudzbina } from '../context/AktivnaPorudzbinaContext';
import styles from './FloatingBubble.module.css';

function useIsDesktop() {
    const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1000);
    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1000px)');
        const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);
    return isDesktop;
}

interface Props {
    onOtvoriKorpu: () => void;
    sakrijenNaDesktop?: boolean;
}

export default function FloatingBubble({ onOtvoriKorpu, sakrijenNaDesktop }: Props) {
    const { ukupnoStavki } = useCart();
    const { aktivnaId, otvoriStatus } = useAktivnaPorudzbina();
    const isDesktop = useIsDesktop();

    // Na desktopu (npr. MeniPage, gde već postoji MiniKorpa) skrivamo bubble —
    // osim ako postoji aktivna porudžbina (tad je koristan za brzo praćenje).
    const sakrij = sakrijenNaDesktop && isDesktop && aktivnaId === null;
    const prikazan = (aktivnaId !== null || ukupnoStavki > 0) && !sakrij;

    const handleClick = aktivnaId ? () => otvoriStatus(aktivnaId) : onOtvoriKorpu;

    return (
        <AnimatePresence>
            {prikazan && (
                <motion.button
                    className={`${styles.bubble} ${aktivnaId ? styles.aktivan : ''}`}
                    onClick={handleClick}
                    initial={{ x: 80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 80, opacity: 0 }}
                    transition={{ type: 'spring', damping: 24, stiffness: 280 }}
                    whileTap={{ scale: 0.92 }}
                >
                    {aktivnaId ? (
                        <ChefHat size={22} strokeWidth={1.5} />
                    ) : (
                        <>
                            <ShoppingBag size={22} strokeWidth={1.5} />
                            <AnimatePresence>
                                {ukupnoStavki > 0 && (
                                    <motion.span
                                        className={styles.badge}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                    >
                                        {ukupnoStavki}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </motion.button>
            )}
        </AnimatePresence>
    );
}
